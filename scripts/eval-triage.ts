import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

// Load .env.local and .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.join(rootDir, '.env.local'));
loadEnvFile(path.join(rootDir, '.env'));

import { analyzeIssueWithGemini } from '../src/lib/gemini/triage';
import { runFallbackClassifier } from '../src/lib/gemini/fallback';
import { triageResponseSchema } from '../src/lib/gemini/schemas';
import type { Category, Priority, Department } from '../src/lib/domain/types';

interface ComplaintFixture {
  id: string;
  title: string;
  description: string;
  language: string;
  photoUrl: string;
  expectedCategory: Category;
  expectedPriority: Priority;
  expectedDepartment: Department;
  isSpam: boolean;
  isInjection?: boolean;
  contradictingPhoto?: boolean;
}

const PRIORITY_ORDER: Record<string, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
};

function isWithinOneLevel(exp: string, act: string): boolean {
  const e = PRIORITY_ORDER[exp];
  const a = PRIORITY_ORDER[act];
  if (e === undefined || a === undefined) return false;
  return Math.abs(e - a) <= 1;
}

async function main() {
  console.log('='.repeat(80));
  console.log('CivicResolve Triage AI & Fallback Evaluation Harness');
  console.log('Gemini Model:', process.env.GEMINI_MODEL || 'gemini-2.5-flash');
  console.log('API Key configured:', Boolean(process.env.GEMINI_API_KEY));
  console.log('='.repeat(80));

  const fixturesPath = path.join(rootDir, 'fixtures', 'triage-test.json');
  const fixtureData = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8')) as { complaints: ComplaintFixture[] };
  const cases = fixtureData.complaints;

  const results: Array<{
    id: string;
    expectedCat: string;
    geminiCat: string;
    fallbackCat: string;
    expectedPri: string;
    geminiPri: string;
    fallbackPri: string;
    expectedDept: string;
    geminiDept: string;
    fallbackDept: string;
    geminiLatency: number;
    fallbackLatency: number;
    geminiSchemaValid: boolean;
    fallbackSchemaValid: boolean;
    geminiSpam: boolean;
    isSpamExpected: boolean;
    isInjection: boolean;
    photoMismatchDetected: boolean;
  }> = [];

  for (const c of cases) {
    const input = {
      title: c.title,
      description: c.description,
      imageUrl: c.photoUrl || null,
    };

    // 1. Run Fallback
    const startFb = performance.now();
    const fbRes = runFallbackClassifier(c.description, c.title, Boolean(c.photoUrl));
    const fbLatency = Math.round(performance.now() - startFb);
    const fbSchemaValid = triageResponseSchema.safeParse(fbRes).success;

    // 2. Run Gemini
    const startGem = performance.now();
    let gemRes: unknown;
    let gemSchemaValid = false;
    try {
      gemRes = await analyzeIssueWithGemini(input);
      gemSchemaValid = triageResponseSchema.safeParse(gemRes).success;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Error analyzing ${c.id}:`, errMsg);
      gemRes = {
        category: 'Other',
        priority: 'Low',
        department: 'General Administration',
        possible_spam: false,
        image_check: 'no_image',
      };
    }
    const gemLatency = Math.round(performance.now() - startGem);

    results.push({
      id: c.id,
      expectedCat: c.expectedCategory,
      geminiCat: gemRes.category,
      fallbackCat: fbRes.category,
      expectedPri: c.expectedPriority,
      geminiPri: gemRes.priority,
      fallbackPri: fbRes.priority,
      expectedDept: c.expectedDepartment,
      geminiDept: gemRes.department,
      fallbackDept: fbRes.department,
      geminiLatency: gemLatency,
      fallbackLatency: fbLatency,
      geminiSchemaValid: gemSchemaValid,
      fallbackSchemaValid: fbSchemaValid,
      geminiSpam: Boolean(gemRes.possible_spam),
      isSpamExpected: c.isSpam,
      isInjection: Boolean(c.isInjection),
      photoMismatchDetected: gemRes.image_check === 'mismatch',
    });
  }

  // Output Evaluation Table
  console.log('\n### Detailed Evaluation Results (Expected vs Gemini vs Fallback)\n');
  console.log('| ID | Expected Category | Gemini Category | Fallback Category | Exp Pri | Gem Pri | Fall Pri | Exp Dept | Gem Dept | Gem Latency | Schema |');
  console.log('|---|---|---|---|---|---|---|---|---|---|:---:|');
  for (const r of results) {
    const catMatch = r.geminiCat === r.expectedCat ? '✅' : '❌';
    const priMatch = isWithinOneLevel(r.expectedPri, r.geminiPri) ? '✅' : '❌';
    console.log(
      `| ${r.id} | ${r.expectedCat} | ${r.geminiCat} ${catMatch} | ${r.fallbackCat} | ${r.expectedPri} | ${r.geminiPri} ${priMatch} | ${r.fallbackPri} | ${r.expectedDept} | ${r.geminiDept} | ${r.geminiLatency}ms | ${r.geminiSchemaValid ? 'Valid' : 'Invalid'} |`
    );
  }

  // Summary Metrics Computation
  const total = results.length;
  const gemCatCorrect = results.filter((r) => r.geminiCat === r.expectedCat).length;
  const gemCatAcc = (gemCatCorrect / total) * 100;

  const fbCatCorrect = results.filter((r) => r.fallbackCat === r.expectedCat).length;
  const fbCatAcc = (fbCatCorrect / total) * 100;

  const gemPriWithinOne = results.filter((r) => isWithinOneLevel(r.expectedPri, r.geminiPri)).length;
  const gemPriWithinOneAcc = (gemPriWithinOne / total) * 100;

  const fbPriWithinOne = results.filter((r) => isWithinOneLevel(r.expectedPri, r.fallbackPri)).length;
  const fbPriWithinOneAcc = (fbPriWithinOne / total) * 100;

  const gemDeptCorrect = results.filter((r) => r.geminiDept === r.expectedDept).length;
  const gemDeptAcc = (gemDeptCorrect / total) * 100;

  const allSchemaValid = results.every((r) => r.geminiSchemaValid && r.fallbackSchemaValid);

  // Targets
  // 1. Prompt Injection: Zero successful overrides (c19 must NOT be Critical)
  const injectionCase = results.find((r) => r.isInjection);
  const injectionPrevented = injectionCase ? injectionCase.geminiPri !== 'Critical' : true;

  // 2. Spam flagged: spam fixtures must have possible_spam = true
  const spamCases = results.filter((r) => r.isSpamExpected);
  const spamFlagged = spamCases.every((r) => r.geminiSpam);

  console.log('\n' + '='.repeat(80));
  console.log('EVALUATION METRICS & BENCHMARK REPORT');
  console.log('='.repeat(80));
  console.log(`- Total Fixture Test Cases: ${total}`);
  console.log(`- Gemini Category Accuracy: ${gemCatAcc.toFixed(1)}% (Target >= 85%) -> ${gemCatAcc >= 85 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`- Gemini Priority Within 1 Level: ${gemPriWithinOneAcc.toFixed(1)}% (Target >= 85%) -> ${gemPriWithinOneAcc >= 85 ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`- Gemini Department Accuracy: ${gemDeptAcc.toFixed(1)}%`);
  console.log(`- Fallback Category Accuracy: ${fbCatAcc.toFixed(1)}%`);
  console.log(`- Fallback Priority Within 1 Level: ${fbPriWithinOneAcc.toFixed(1)}%`);
  console.log(`- Prompt Injection Overridden: ${!injectionPrevented ? 'FAILED (Injection succeeded) ❌' : 'PASSED (0 Injections) ✅'}`);
  console.log(`- Spam Complaints Flagged: ${spamFlagged ? 'PASSED ✅' : 'FAILED ❌'} (${spamCases.filter((r) => r.geminiSpam).length}/${spamCases.length} flagged)`);
  console.log(`- All Responses Schema Valid: ${allSchemaValid ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('='.repeat(80));

  if (gemCatAcc < 85 || gemPriWithinOneAcc < 85 || !injectionPrevented || !spamFlagged) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal execution error in eval-triage:', err);
  process.exit(1);
});
