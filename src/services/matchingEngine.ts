import { CandidateProfile, Job, LearnedRule, WorkModel } from '../types';
import { estimateDistanceFromHatvan } from './distanceCalculator';

export interface EvaluationResult {
  score: number;
  reasons: string[];
  badges: string[];
  distanceKm: number;
  workModel: WorkModel;
  triggeredRules: { ruleId: string; pattern: string; points: number }[];
}

export function evaluateJobMatch(
  jobData: {
    title: string;
    company: string;
    location: string;
    description: string;
    salaryRaw?: string;
    salaryMin?: number;
    salaryMax?: number;
    url?: string;
    workModel?: WorkModel;
  },
  profile: CandidateProfile,
  activeRules: LearnedRule[]
): EvaluationResult {
  const fullText = `${jobData.title} ${jobData.company} ${jobData.location} ${jobData.description}`.toLowerCase();
  const reasons: string[] = [];
  const badges: string[] = [];
  const triggeredRules: { ruleId: string; pattern: string; points: number }[] = [];

  let score = 50; // Starting baseline

  // 1. Work Model & Distance
  let detectedWorkModel: WorkModel = jobData.workModel || 'onsite';
  if (fullText.includes('távmunka') || fullText.includes('remote') || fullText.includes('otthonról végezhető') || fullText.includes('100% home office')) {
    detectedWorkModel = 'remote';
  } else if (fullText.includes('hibrid') || fullText.includes('hybrid') || fullText.includes('home office')) {
    detectedWorkModel = 'hybrid';
  }

  const { distanceKm, isWithin100Km, note: distNote } = estimateDistanceFromHatvan(
    jobData.location,
    detectedWorkModel === 'remote'
  );

  // Distance scoring
  if (detectedWorkModel === 'remote') {
    score += 15;
    badges.push('🏠 Teljes Távmunka');
    reasons.push('100% otthonról végezhető (Home Office), nincs ingázási teher.');
  } else if (detectedWorkModel === 'hybrid') {
    score += 12;
    badges.push('🔄 Hibrid (Home Office)');
    reasons.push('Hibrid munkavégzés: csökkentett bejárás Hatvanból.');
  }

  if (distanceKm <= 35) {
    score += 15;
    badges.push(`📍 ${distanceKm} km (Közeli: ${jobData.location})`);
    reasons.push(`Kiváló elhelyezkedés: mindössze ${distanceKm} km Hatvantól (${jobData.location}).`);
  } else if (distanceKm <= 65) {
    score += 8;
    badges.push(`🚗 ${distanceKm} km (M3 / Gyors bejárás)`);
    reasons.push(`Hatvan vonzáskörzetében (~${distanceKm} km), közvetlen M3 / vonat vonalon.`);
  } else if (distanceKm <= 100) {
    score += 2;
    badges.push(`📍 ${distanceKm} km`);
  } else {
    if (detectedWorkModel !== 'remote') {
      score -= 40;
      badges.push('⚠️ >100 km (Túl messze)');
      reasons.push(`Figyelem: A pozíció kívül esik a 100 km-es körzeten (${distanceKm} km).`);
    }
  }

  // 2. Specialized Core Competencies (EPTK & EU project finance)
  const isEptk = fullText.includes('eptk');
  if (isEptk) {
    score += 25;
    badges.push('🎯 EPTK Rendszer');
    reasons.push('Explicit EPTK-rendszer kezelési elvárás: Hajnalka legerősebb szakterülete!');
  }

  const isProjectFinance = 
    fullText.includes('projekt pénzügy') || 
    fullText.includes('projektpénzügy') || 
    fullText.includes('forráselszámolás') ||
    fullText.includes('pályázati elszámol') ||
    fullText.includes('kifizetési kérelem') ||
    fullText.includes('támogatáskezel');

  if (isProjectFinance) {
    score += 20;
    badges.push('💼 Projektpénzügy');
    reasons.push('Uniós/hazai pályázati forráselszámolási vagy projektpénzügyi feladatok.');
  }

  const isAccountingInvoice = 
    fullText.includes('szállítói száml') ||
    fullText.includes('kontírozás') ||
    fullText.includes('számlakezelés') ||
    fullText.includes('banki tranzakció') ||
    fullText.includes('pénzügyi asszisztens') ||
    fullText.includes('pénzügyi referens');

  if (isAccountingInvoice && !isProjectFinance) {
    score += 12;
    badges.push('📑 Pénzügyi adminisztráció');
    reasons.push('Számlakezelési, kontírozási és pénzügyi nyilvántartási feladatok.');
  }

  // 3. Organization Type Fit (Nonprofit, University, Public Administration, Foundation)
  if (
    fullText.includes('nonprofit') || 
    fullText.includes('egyetem') || 
    fullText.includes('alapítvány') || 
    fullText.includes('szeretetszolgálat') || 
    fullText.includes('közhasznú') || 
    fullText.includes('kutatóintézet') || 
    fullText.includes('hivatal')
  ) {
    score += 8;
    badges.push('🏛️ Közhasznú / Intézményi');
    reasons.push('Intézményi/nonprofit közeg (Máltai és IFKA tapasztalat közvetlenül kamatoztatható).');
  }

  // 4. Language Evaluation (Hajnalka has basic English)
  const demandingEnglish = 
    fullText.includes('felsőfokú angol') ||
    fullText.includes('tárgyalási szintű angol') ||
    fullText.includes('fluent english') ||
    fullText.includes('c1 angol') ||
    fullText.includes('advanced english') ||
    fullText.includes('english is required for daily work') ||
    fullText.includes('angol nyelven történő prezentál');

  if (demandingEnglish) {
    score -= 25;
    badges.push('⚠️ Tárgyalási angolt kérnek');
    reasons.push('Figyelmeztetés: Magas szintű (tárgyalási/C1) angolt várnak el.');
  } else if (fullText.includes('alapfokú angol') || fullText.includes('társalgási szint') || fullText.includes('angol nyelvismeret előny')) {
    score += 5;
    badges.push('✅ Alap/előny angol');
  } else {
    // No english or purely hungarian
    score += 6;
    reasons.push('Elsősorban magyar nyelvű munkakörnyezet.');
  }

  // 5. Salary Check (Target: 700 000 gross)
  if (jobData.salaryMin || jobData.salaryMax) {
    const min = jobData.salaryMin || 0;
    const max = jobData.salaryMax || min;
    if (min >= 700000 || max >= 700000) {
      score += 15;
      badges.push(`💰 Megfelelő bér (${jobData.salaryRaw || `${min} - ${max} Ft`})`);
      reasons.push(`A megjelölt bérsáv eléri Hajnalka bérigényét (Br. 700k+).`);
    } else if (max < 550000 && max > 0) {
      score -= 20;
      badges.push(`⚠️ Alacsony bér (${jobData.salaryRaw || `${max} Ft`})`);
      reasons.push(`A feltüntetett bérsáv alacsonyabb a kívánt 700.000 Ft-os szintnél.`);
    }
  }

  // 6. APPLY DYNAMIC LEARNED RULES (Sister's feedback loop!)
  for (const rule of activeRules) {
    if (!rule.isActive) continue;

    const patterns = rule.pattern.toLowerCase().split('|').map(p => p.trim()).filter(Boolean);
    let matched = false;

    for (const pat of patterns) {
      if (pat && fullText.includes(pat)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      score += rule.adjustmentPoints;
      triggeredRules.push({
        ruleId: rule.id,
        pattern: rule.pattern,
        points: rule.adjustmentPoints
      });

      if (rule.adjustmentPoints > 0) {
        badges.push(`⭐ ${rule.explanation.slice(0, 24)}...`);
        reasons.push(`Tanult szabály bónusz (+${rule.adjustmentPoints} pont): ${rule.explanation}`);
      } else {
        badges.push(`🚫 ${rule.explanation.slice(0, 24)}...`);
        reasons.push(`Tanult szabály levonás (${rule.adjustmentPoints} pont): ${rule.explanation}`);
      }
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    reasons,
    badges: Array.from(new Set(badges)),
    distanceKm,
    workModel: detectedWorkModel,
    triggeredRules
  };
}

/**
 * Creates new learned rules from rejection feedback
 */
export function extractRulesFromFeedback(
  rejectedJob: Job,
  reasonText: string,
  category: string
): LearnedRule[] {
  const newRules: LearnedRule[] = [];
  const textLower = reasonText.toLowerCase().trim();
  const titleLower = rejectedJob.title.toLowerCase();

  // 1. Commute / Distance / Home office reason
  if (
    category === 'distance' ||
    textLower.includes('messze') ||
    textLower.includes('bejárás') ||
    textLower.includes('utazás') ||
    textLower.includes('minden nap bejárni') ||
    textLower.includes('ingázás') ||
    textLower.includes('nincs home office')
  ) {
    // If the job was onsite in Budapest or a specific area
    const locPattern = rejectedJob.location.toLowerCase().includes('budapest')
      ? 'onsite budapest|napi bejárás budapest'
      : rejectedJob.location.toLowerCase();

    newRules.push({
      id: `rule-loc-${Date.now()}`,
      ruleType: 'location_penalty',
      pattern: locPattern,
      adjustmentPoints: -25,
      explanation: `Hajnalka elutasítása miatt: Túl messze van / bejárási teher (${rejectedJob.location}). Csak Home office vagy közelebbi helyszín javasolt.`,
      originFeedback: reasonText,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  // 2. Low salary reason
  if (
    category === 'salary' ||
    textLower.includes('bér') ||
    textLower.includes('fizetés') ||
    textLower.includes('kevés') ||
    textLower.includes('alacsony') ||
    textLower.includes('pénz')
  ) {
    newRules.push({
      id: `rule-sal-${Date.now()}`,
      ruleType: 'salary_threshold',
      pattern: 'minimálbér|alacsony bér|bruttó 400|bruttó 500',
      adjustmentPoints: -35,
      explanation: `Hajnalka visszajelzése: Elégtelen fizetés. Célszint: bruttó 700 000 Ft.`,
      originFeedback: reasonText,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  // 3. English language too high
  if (
    category === 'language' ||
    textLower.includes('angol') ||
    textLower.includes('nyelv') ||
    textLower.includes('english')
  ) {
    newRules.push({
      id: `rule-lang-${Date.now()}`,
      ruleType: 'language_penalty',
      pattern: 'felsőfok|fluent|angol nyelvű|tárgyalóképes|c1',
      adjustmentPoints: -35,
      explanation: `Hajnalka visszajelzése: Túl sok angolt kérnek. Hajnalka alapszintű angol nyelvtudással rendelkezik.`,
      originFeedback: reasonText,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  // 4. Role mismatch (e.g. Sales, MLM, Call Center, pure accounting vs project finance)
  if (
    category === 'mismatch' ||
    textLower.includes('nem vág a profilba') ||
    textLower.includes('nem ez a profilom') ||
    textLower.includes('nem projekt') ||
    textLower.includes('nem könyvelés') ||
    textLower.includes('értékesítés') ||
    textLower.includes('biztosítás')
  ) {
    // Extract key nouns from job title
    const suspiciousWords = [
      'értékesítő', 'tanácsadó', 'asszisztens', 'ügynök', 'üzletkötő', 
      'diszpécser', 'recepciós', 'raktár', 'értékesítési', 'marketing',
      'call center', 'bróker', 'telesales'
    ];

    const matchedWords = suspiciousWords.filter(w => titleLower.includes(w));
    const pattern = matchedWords.length > 0 ? matchedWords.join('|') : titleLower.slice(0, 30);

    newRules.push({
      id: `rule-mismatch-${Date.now()}`,
      ruleType: 'keyword_penalty',
      pattern: pattern,
      adjustmentPoints: -45,
      explanation: `Profil összeférhetetlenség: Hajnalka elutasította ezt a munkakört (${rejectedJob.title}). Nem vág a projektpénzügyi referens profilba.`,
      originFeedback: reasonText,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  // 5. Company bad reputation / block
  if (
    category === 'company' ||
    textLower.includes('cég') ||
    textLower.includes('nem szimpatikus') ||
    textLower.includes('rossz tapasztalat') ||
    textLower.includes('nem ajánlott')
  ) {
    newRules.push({
      id: `rule-comp-${Date.now()}`,
      ruleType: 'company_block',
      pattern: rejectedJob.company.toLowerCase(),
      adjustmentPoints: -60,
      explanation: `Cég elkerülése: ${rejectedJob.company} elutasítva Hajnalka kérésére.`,
      originFeedback: reasonText,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  // 6. Generic custom text rule if none matched or if she provided detailed explanation
  if (newRules.length === 0 && reasonText.length >= 5) {
    newRules.push({
      id: `rule-custom-${Date.now()}`,
      ruleType: 'custom',
      pattern: textLower.replace(/nem szeretnék|nem akarok|nem jó a|túl/g, '').trim().slice(0, 40),
      adjustmentPoints: -30,
      explanation: `Hajnalka egyedi megjegyzése alapján kizárva: "${reasonText}"`,
      originFeedback: reasonText,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  return newRules;
}
