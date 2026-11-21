import { test, expect, request as playwrightRequest, type Page, type Route } from '@playwright/test';

// Helper to intercept Gemini API calls
async function mockGeminiResponse(page: Page, response: { status: number; body: unknown }) {
  await page.route('**/generativelanguage/**', async (route: Route) => {
    await route.fulfill({
      status: response.status,
      body: JSON.stringify(response.body),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

test.describe('Adversarial QA Suite', () => {
  test.beforeAll(async () => {
    // Ensure server is running at localhost:3000
    // No action needed; dev server started earlier.
  });

  test('1. GEMINI_API_KEY missing (fallback)', async ({ page }) => {
    // Simulate Gemini returning 401 (missing/invalid key)
    await mockGeminiResponse(page, { status: 401, body: { error: { message: 'Invalid API Key' } } });
    await page.goto('http://localhost:3000');
    // Fill form with minimal data and submit
    await page.fill('textarea[name="description"]', 'Test issue');
    await page.click('button:has-text("Submit")');
    // Expect fallback label appears
    await expect(page.locator('text=Fallback')).toBeVisible();
  });

  test('1b. GEMINI_API_KEY rate‑limited (429)', async ({ page }) => {
    await mockGeminiResponse(page, { status: 429, body: { error: { message: 'Rate limit exceeded' } } });
    await page.goto('http://localhost:3000');
    await page.fill('textarea[name="description"]', 'Rate limit test');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Rate limit')).toBeVisible();
  });

  test('2. Malformed JSON from Gemini', async ({ page }) => {
    await page.route('**/generativelanguage/**', async route => {
      await route.fulfill({ status: 200, body: 'not a json', headers: { 'Content-Type': 'application/json' } });
    });
    await page.goto('http://localhost:3000');
    await page.fill('textarea[name="description"]', 'Bad JSON');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Fallback')).toBeVisible();
  });

  test('3a. Oversized image', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // generate a large base64 image (>5MB)
    const largeData = 'data:image/png;base64,' + 'a'.repeat(6 * 1024 * 1024);
    await page.evaluate((data) => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File([Uint8Array.from(atob(data.split(",")[1]), c => c.charCodeAt(0))], 'big.png', { type: 'image/png' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
    }, largeData);
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Image too large')).toBeVisible();
  });

  test('3b. Wrong file type', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const txtFile = new File(['hello'], 'test.txt', { type: 'text/plain' });
    await page.evaluate((file) => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
    }, txtFile);
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Invalid file type')).toBeVisible();
  });

  test('3c. Corrupt image data', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const corruptData = 'data:image/png;base64,abcd1234'; // invalid base64
    await page.evaluate((data) => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      // create a Blob directly with corrupt data
      const blob = new Blob([data], { type: 'image/png' });
      const file = new File([blob], 'corrupt.png', { type: 'image/png' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
    }, corruptData);
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Corrupt image')).toBeVisible();
  });

  test('3d. No image (should succeed)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('textarea[name="description"]', 'No image case');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Issue submitted')).toBeVisible();
  });

  test('4. Location permission denied', async ({ page, context }) => {
    await context.grantPermissions([], { origin: 'http://localhost:3000' }); // deny all
    await page.goto('http://localhost:3000');
    await page.click('text=Use my location');
    await expect(page.locator('text=Location permission denied')).toBeVisible();
  });

  test('4b. Map tiles fail to load', async ({ page }) => {
    await page.route('**/tile.openstreetmap.org/**', route => route.abort());
    await page.goto('http://localhost:3000');
    // Open map component if needed
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Map failed')).toBeVisible();
  });

  test('5. Double‑click Submit (no duplicate)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('textarea[name="description"]', 'Duplicate test');
    await page.dblclick('button:has-text("Submit")');
    // Count number of issue cards created
    const cards = await page.locator('.issue-card').count();
    expect(cards).toBe(1);
  });

  test('5b. Refresh mid‑submit', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('textarea[name="description"]', 'Refresh test');
    // intercept submit request to delay
    await page.route('**/api/issues', async route => {
      await new Promise(r => setTimeout(r, 2000));
      await route.continue();
    });
    await page.click('button:has-text("Submit")');
    await page.reload();
    // After reload, ensure only one issue created
    const cards = await page.locator('.issue-card').count();
    expect(cards).toBe(1);
  });

  test('6. XSS payload inert', async ({ page }) => {
    const xss = "<script>alert('xss')</script>";
    await page.goto('http://localhost:3000');
    await page.fill('input[name="title"]', xss);
    await page.fill('textarea[name="description"]', xss);
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=<script>alert(\'xss\')</script>')).toBeVisible();
  });

  test('6b. SQL‑injection style input', async ({ page }) => {
    const sql = "' OR '1'='1; DROP TABLE issues;--";
    await page.goto('http://localhost:3000');
    await page.fill('input[name="title"]', sql);
    await page.fill('textarea[name="description"]', sql);
    await page.click('button:has-text("Submit")');
    await expect(page.locator('text=Issue submitted')).toBeVisible();
    // Verify DB not corrupted by checking another fetch works
    await page.goto('http://localhost:3000/issues');
    await expect(page.locator('.issue-card')).toBeVisible();
  });

  test('7. Admin routes without session (401)', async ({ request }) => {
    const resp = await request.get('http://localhost:3000/api/admin/stats');
    expect(resp.status()).toBe(401);
  });

  test('8. Expired admin session', async ({ request }) => {
    // login as admin first
    const loginResp = await request.post('http://localhost:3000/api/admin/login', { data: { password: 'admin' } });
    const cookies = await loginResp.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie');
    // expire cookie manually by setting past date
    const expiredCookie = cookies[0].value.replace(/Expires=[^;]+/, 'Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    const ctx = await playwrightRequest.newContext({ extraHTTPHeaders: { cookie: expiredCookie } });
    const resp = await ctx.get('http://localhost:3000/api/admin/stats');
    expect(resp.status()).toBe(401);
  });

  test('9. Quick status updates', async ({ page }) => {
    await page.goto('http://localhost:3000/issues/1');
    await page.click('button[data-status="In Progress"]');
    await page.click('button[data-status="Resolved"]');
    // Verify final status is Resolved
    await expect(page.locator('text=Status: Resolved')).toBeVisible();
  });

  test('10. Missing tracking code 404 clean', async ({ page }) => {
    await page.goto('http://localhost:3000/track/UNKNOWNCODE');
    await expect(page.locator('text=Tracking code not found')).toBeVisible();
    // Ensure no stack trace element present
    await expect(page.locator('.stack-trace')).toHaveCount(0);
  });
});
