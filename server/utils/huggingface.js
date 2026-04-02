import axios from 'axios';

const HF_API_URL = `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_ID}`;
const HF_TOKEN   = process.env.HF_API_TOKEN;

const CRIME_CATEGORIES = [
  'Homicide','Attempted Murder','Aggravated Assault','Simple Assault',
  'Kidnapping','Sexual Assault','Domestic Violence','Burglary',
  'Larceny/Theft','Motor Vehicle Theft','Arson','Vandalism/Property Damage',
  'Trespassing','Fraud/Deception','Cybercrime/Hacking','Identity Theft',
  'Extortion/Blackmail','Embezzlement','Drug Trafficking','Drug Possession',
  'Weapons Offenses','Disorderly Conduct','Traffic/DUI','Hit and Run',
  'Stalking','Harassment','Robbery'
];

const RAW_EXAMPLES = [
  { input:'Someone hacked into my email account and changed the password', cats:['Cybercrime/Hacking'], sev:'High' },
  { input:'I received a fake UPI payment request and lost money', cats:['Fraud/Deception'], sev:'High' },
  { input:'Someone used my Aadhaar card to open a bank account without my knowledge', cats:['Identity Theft'], sev:'Critical' },
  { input:'Receiving continuous abusive messages from an unknown number', cats:['Harassment'], sev:'Medium' },
  { input:'Someone has my private photos and is demanding money to not share them', cats:['Extortion/Blackmail'], sev:'Critical' },
  { input:'My car was stolen from the parking lot outside the mall', cats:['Motor Vehicle Theft'], sev:'High' },
  { input:'My husband beats me regularly and I have visible injuries', cats:['Domestic Violence'], sev:'Critical' },
  { input:'A group of men stopped my car and robbed me at knifepoint', cats:['Robbery'], sev:'Critical' },
  { input:'My child did not return from school and phone is switched off', cats:['Kidnapping'], sev:'Critical' },
];

function buildFewShotExamples() {
  return RAW_EXAMPLES
    .map((e, i) => `Example ${i+1}: "${e.input}"\n=> {"categories": ${JSON.stringify(e.cats)}, "severity": "${e.sev}"}`)
    .join('\n\n');
}

function buildPrompt(englishText) {
  const catList  = CRIME_CATEGORIES.join(', ');
  const examples = buildFewShotExamples();
  return [
    '<|system|>',
    'You are a professional Indian cybercrime classification officer.',
    `Classify the complaint into 1-2 categories from this list: ${catList}.`,
    'Assign severity: Critical, High, Medium, or Low.',
    'Output ONLY valid JSON. No explanation. No markdown.',
    '',
    'RULES:',
    '1. UPI fraud => Fraud/Deception (NOT Cybercrime/Hacking)',
    '2. Account takeover => Cybercrime/Hacking',
    '3. Physical violence => Aggravated Assault or Domestic Violence',
    '4. Threats + money demand => Extortion/Blackmail',
    '5. Financial loss over 10000 Rs => High severity minimum',
    '6. Life threat or child involved => Critical severity',
    '',
    'EXAMPLES:',
    examples,
    '',
    'OUTPUT FORMAT (JSON only):',
    '{"categories": ["Category1"], "severity": "High"}',
    'OR',
    '{"categories": ["Category1", "Category2"], "severity": "High"}',
    '<|end|>',
    '<|user|>',
    `Classify this complaint: "${englishText}"`,
    '<|end|>',
    '<|assistant|>',
    '{"'
  ].join('\n');
}

function parseZephyrResponse(rawText) {
  const text = '{"' + rawText;
  try {
    const m = text.match(/\{[^}]+\}/);
    if (m) { const p = JSON.parse(m[0]); if (p.categories && p.severity) return p; }
  } catch (_) {}
  const catMatch = text.match(/"categories"\s*:\s*\[([^\]]+)\]/);
  const sevMatch = text.match(/"severity"\s*:\s*"(Critical|High|Medium|Low)"/);
  if (catMatch && sevMatch) {
    const cats = catMatch[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g,'')) || [];
    return { categories: cats, severity: sevMatch[1] };
  }
  return null;
}

function keywordFallback(text) {
  const lower = text.toLowerCase();
  const rules = [
    { keywords:['hack','hacked','account tak','unauthorized'], category:'Cybercrime/Hacking', severity:'High' },
    { keywords:['upi','paytm','fraud','fake','scam','cheat','dhoka'], category:'Fraud/Deception', severity:'High' },
    { keywords:['blackmail','threat','private photo','video leak','extort'], category:'Extortion/Blackmail', severity:'Critical' },
    { keywords:['stalk','follow','track','location','spy'], category:'Stalking', severity:'High' },
    { keywords:['harass','message','abuse','troll','bully'], category:'Harassment', severity:'Medium' },
    { keywords:['steal','theft','stolen','chori','nikal'], category:'Larceny/Theft', severity:'Medium' },
    { keywords:['rob','robbery','knife','gun','dacoity'], category:'Robbery', severity:'Critical' },
    { keywords:['kidnap','abduct','missing','ransom'], category:'Kidnapping', severity:'Critical' },
    { keywords:['beat','assault','hurt','attack','maara'], category:'Aggravated Assault', severity:'High' },
    { keywords:['domestic','husband','wife','dowry','sasural'], category:'Domestic Violence', severity:'Critical' },
    { keywords:['drug','narco','ganja','brown sugar'], category:'Drug Trafficking', severity:'High' },
    { keywords:['identity','aadhaar','pan card','impersonat'], category:'Identity Theft', severity:'Critical' },
  ];
  for (const rule of rules) {
    if (rule.keywords.some(kw => lower.includes(kw)))
      return { categories:[rule.category], severity:rule.severity, source:'fallback' };
  }
  return { categories:['Fraud/Deception'], severity:'Medium', source:'fallback' };
}

export async function classifyWithZephyr(englishText, retries = 2) {
  const prompt = buildPrompt(englishText);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        HF_API_URL,
        { inputs: prompt, parameters: { temperature:0.1, max_new_tokens:80, return_full_text:false, do_sample:true, top_p:0.9, repetition_penalty:1.2 } },
        { headers: { Authorization: `Bearer ${HF_TOKEN}` }, timeout: 30000 }
      );
      const rawText = Array.isArray(response.data)
        ? response.data[0]?.generated_text
        : response.data?.generated_text;
      if (rawText) {
        const parsed = parseZephyrResponse(rawText);
        if (parsed) {
          const validCats = parsed.categories.filter(c => CRIME_CATEGORIES.includes(c));
          const validSevs = ['Critical','High','Medium','Low'];
          return {
            categories: validCats.length > 0 ? validCats.slice(0,2) : ['Fraud/Deception'],
            severity:   validSevs.includes(parsed.severity) ? parsed.severity : 'Medium',
            source:     'zephyr'
          };
        }
      }
    } catch (err) {
      if (err.response?.status === 503 && attempt < retries) {
        console.log(`HF model loading, waiting 20s (attempt ${attempt+1}/${retries})...`);
        await new Promise(r => setTimeout(r, 20000));
        continue;
      }
      console.error(`HuggingFace error (attempt ${attempt+1}):`, err.message);
      if (attempt < retries) continue;
    }
  }
  console.log('Using keyword fallback classifier');
  return keywordFallback(englishText);
}

export function calculateConfidence(categories, severity, source) {
  if (source === 'fallback') return '45%';
  const highConf = ['Cybercrime/Hacking','Fraud/Deception','Robbery','Kidnapping','Domestic Violence','Extortion/Blackmail','Identity Theft'];
  const base  = highConf.includes(categories[0]) ? 78 : 65;
  const bonus = severity === 'Critical' ? 8 : severity === 'High' ? 5 : 0;
  return `${base + bonus}%`;
}

export const VICTIM_GUIDANCE = {
  Critical: [
    'Call 112 immediately if you are in physical danger',
    'Contact Cyber Crime Cell: 1930 right now',
    'Do not delete any evidence — screenshots, messages, call logs',
    'An officer will contact you within 30 minutes'
  ],
  High: [
    'Call 1930 (National Cyber Crime Helpline)',
    'Block your bank account/UPI immediately if financial fraud',
    'Save all evidence: screenshots, transaction IDs, chat logs',
    'An officer will follow up within 2 hours'
  ],
  Medium: [
    'Keep your reference number safe',
    'Note down all incident details with dates and times',
    'Do not engage further with the harasser',
    'An officer will review your complaint within 24 hours'
  ],
  Low: [
    'Your complaint has been registered successfully',
    'Keep your reference number for follow-up',
    'An officer will review within 48 hours'
  ]
};

export function getVictimGuidance(severity) {
  return VICTIM_GUIDANCE[severity] || VICTIM_GUIDANCE.Low;
}
