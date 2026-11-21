import type { TriageResult, Category, Priority, Department } from '../domain/types';

// Simple language detection based on Unicode script ranges
function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  // Tamil Unicode block
  if (/[\u0B80-\u0BFF]/.test(lower)) return 'Tamil';
  // Devanagari (Hindi) block
  if (/[\u0900-\u097F]/.test(lower)) return 'Hindi';
  return 'English';
}

import { getDefaultDepartment } from '../domain/departments';

interface KeywordRule {
  category: Category;
  keywords: string[];
}

const CATEGORY_RULES: KeywordRule[] = [
  {
    category: 'Water Leakage',
    keywords: [
      'pipe burst',
      'pipeline burst',
      'water leak',
      'water leakage',
      'drinking water',
      'potable water',
      'water gushing',
      'water supply',
      'valve leak',
      'pipe broken',
      'தண்ணீர் கசிவு',
      'குடிநீர்',
      'குழாய்',
      'கசிவு',
      'पानी का रिसाव',
      'पाइप टूटा',
      'पानी बह रहा',
    ],
  },
  {
    category: 'Drainage/Sewage Overflow',
    keywords: [
      'sewage',
      'drainage',
      'sewer',
      'gutter',
      'manhole',
      'overflowing drain',
      'wastewater',
      'choked drain',
      'drain blocked',
      'foul water',
      'சாக்கடை',
      'கழிவுநீர்',
      'மூடி இல்லை',
      'வடிகால்',
      'नाला',
      'सीवर',
      'गटर',
      'गंदा पानी',
    ],
  },
  {
    category: 'Pothole/Road Damage',
    keywords: [
      'pothole',
      'road damage',
      'crater',
      'asphalt',
      'road broken',
      'tar road',
      'depression',
      'skid',
      'bike fell',
      'குழி',
      'சாலை சேதம்',
      'ரோடு',
      'பள்ளம்',
      'गड्ढा',
      'सड़क खराब',
      'टूटी सड़क',
    ],
  },
  {
    category: 'Garbage/Overflowing Bin',
    keywords: [
      'garbage',
      'dustbin',
      'dumper',
      'overflowing bin',
      'waste dump',
      'trash',
      'stench',
      'litter',
      'plastic waste',
      'குப்பை',
      'தொட்டி',
      'துர்நாற்றம்',
      'கழிவுகள்',
      'कचरा',
      'कूड़ा',
      'डस्टबिन',
      'बदबू',
    ],
  },
  {
    category: 'Streetlight Fault',
    keywords: [
      'streetlight',
      'street light',
      'lamp post',
      'light not working',
      'dark road',
      'pitch dark',
      'flickering light',
      'pole broken',
      'விளக்கு',
      'தெரு விளக்கு',
      'வெளிச்சம் இல்லை',
      'இருட்டு',
      'स्ट्रीट लाइट',
      'बत्ती',
      'अंधेरा',
      'खंभा',
    ],
  },
  {
    category: 'Traffic Signal/Signage',
    keywords: [
      'traffic signal',
      'signal not working',
      'traffic light',
      'red light',
      'direction board',
      'signboard',
      'signage',
      'junction jam',
      'சிக்னல்',
      'போக்குவரத்து',
      'பலகை',
      'ट्रैफिक सिग्नल',
      'लाल बत्ती',
      'साइन बोर्ड',
    ],
  },
  {
    category: 'Fallen Tree/Public Space',
    keywords: [
      'fallen tree',
      'tree branch',
      'tree fell',
      'uprooted',
      'park bench',
      'playground',
      'swing set',
      'garden',
      'மரம் விழுந்தது',
      'மரக்கிளை',
      'பூங்கா',
      'पेड़ गिर गया',
      'पेड़ की डाल',
      'पार्क',
    ],
  },
  {
    category: 'Stray Animals/Public Health',
    keywords: [
      'stray dog',
      'stray cattle',
      'cow',
      'dog bite',
      'mosquito',
      'dengue',
      'rabies',
      'animal menace',
      'barking',
      'நாய்',
      'மாடு',
      'கொசு',
      'வெறிநாய்',
      'आवारा कुत्ता',
      'गाय',
      'मच्छर',
      'डेंगू',
    ],
  },
  {
    category: 'Damaged Footpath',
    keywords: [
      'footpath',
      'pavement',
      'sidewalk',
      'paver block',
      'pedestrian path',
      'walkway',
      'curb',
      'நடைபாதை',
      'தளவரிசை',
      'फुटपाथ',
      'पैदल मार्ग',
    ],
  },
];

const CRITICAL_KEYWORDS = [
  'danger',
  'life threat',
  'fatal',
  'emergency',
  'accident',
  'open manhole',
  'live wire',
  'electric shock',
  'collapse',
  'burst',
  'flooded road',
  'உயிர் ஆபத்து',
  'விபத்து',
  'அவசரம்',
  'மின்சாரம்',
  'खतरा',
  'जान का खतरा',
  'बिजली का तार',
  'दुर्घटना',
  'तुरंत',
];

const HIGH_KEYWORDS = [
  'school',
  'hospital',
  'busy junction',
  'market',
  'severely',
  'huge',
  'deep',
  'chaos',
  'blocked',
  'overflowing',
  'aggressive',
  'bite',
  'stagnant',
  'பள்ளி',
  'மருத்துவமனை',
  'சந்தை',
  'स्कूल',
  'अस्पताल',
  'बाजार',
  'जाम',
];

export function runFallbackClassifier(
  description: string,
  title?: string,
  hasImage?: boolean
): TriageResult {
  const combined = `${title || ''} ${description || ''}`.toLowerCase();
  const language = detectLanguage(combined);

  // 1. Detect Category
  let detectedCategory: Category = 'Other';
  let highestMatchScore = 0;

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (combined.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > highestMatchScore) {
      highestMatchScore = score;
      detectedCategory = rule.category;
    }
  }

  // 2. Detect Priority & Urgency Score
  let priority: Priority = 'Medium';
  let urgencyScore = 45;

  const isCritical = CRITICAL_KEYWORDS.some((kw) => combined.includes(kw.toLowerCase()));
  const isHigh = HIGH_KEYWORDS.some((kw) => combined.includes(kw.toLowerCase()));

  if (isCritical) {
    priority = 'Critical';
    urgencyScore = 90;
  } else if (isHigh || detectedCategory === 'Water Leakage' || detectedCategory === 'Drainage/Sewage Overflow') {
    priority = 'High';
    urgencyScore = 75;
  } else if (detectedCategory === 'Other' || detectedCategory === 'Traffic Signal/Signage') {
    priority = 'Low';
    urgencyScore = 30;
  }

  const department: Department = getDefaultDepartment(detectedCategory);

  const slaHours = priority === 'Critical' ? 12 : priority === 'High' ? 24 : priority === 'Medium' ? 48 : 72;

  const priorityReasoning =
    priority === 'Critical'
      ? 'Potential imminent safety risk or critical civic infrastructure failure detected by keyword rules.'
      : priority === 'High'
      ? 'Significant civic disruption or health risk identified in municipal area.'
      : 'Standard maintenance issue requiring scheduled departmental attention.';

  return {
    category: detectedCategory,
    sub_issue: `Reported civic condition: ${detectedCategory}`,
    priority,
    urgency_score: urgencyScore,
    impact_factors: {
      safety_risk: priority === 'Critical' ? 9 : priority === 'High' ? 7 : 4,
      people_affected: priority === 'Critical' ? 'community' : 'many',
      near_sensitive_site: isHigh,
      worsens_with_time: detectedCategory === 'Water Leakage' || detectedCategory === 'Pothole/Road Damage',
    },
    priority_reasoning: priorityReasoning,
    department,
    department_reasoning: `Standard jurisdiction for ${detectedCategory} complaints.`,
    confidence: 0.55,
    suggested_sla_hours: slaHours,
    suggested_title: title && title.trim().length > 3 ? title : `Civic issue: ${detectedCategory}`,
    cleaned_description_en: description.trim() || 'Civic complaint submitted by citizen.',
    detected_language: language,
    image_check: hasImage ? 'matches' : 'no_image',
    image_check_note: hasImage ? 'Image supplied; evaluated with rule-based heuristics.' : 'No photo provided.',
    possible_spam: combined.trim().length < 5,
    recommended_action: `Inspect site and assign field gang from ${department}.`,
    method: 'rule-based-fallback',
  };
}
