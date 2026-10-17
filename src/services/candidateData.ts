import { CandidateProfile, LearnedRule } from '../types';

export const HAJNALKA_PROFILE: CandidateProfile = {
  name: "Purczeld Hajnalka",
  email: "purczeld.hajnalka@gmail.com",
  phone: "06202968545",
  baseLocation: "Hatvan",
  maxDistanceKm: 100,
  targetSalaryGross: 700000,
  englishLevel: "alap",
  experienceYears: 4,
  coreStrengths: [
    "EPTK-rendszer haladó szintű kezelése (kifizetési kérelmek, hiánypótlások, szállítói szerződésmodul)",
    "EU-s finanszírozású projektek pénzügyi elszámolása és forráselszámolás",
    "Szállítói számlák teljes körű ellenőrzése, kontírozása, archiválása",
    "Projektköltségek monitorozása, költségvetési keretek betartatása",
    "Banki tranzakciók nyomon követése, kivonatok egyeztetése",
    "Beszerzési folyamatok pénzügyi ellenőrzése és dokumentálása",
    "Közhasznú és nonprofit szervezeti tapasztalat (Magyar Máltai Szeretetszolgálat, IFKA Nonprofit Kft)",
    "Pénzügy és számvitel felsőfokú tanulmányok (MATE Gyöngyös, 2026), OKJ Pénzügyi számviteli ügyintéző (Hatvan)"
  ],
  targetTitles: [
    "Projekt pénzügyi referens",
    "Pályázati pénzügyi elszámoló",
    "EPTK referens",
    "Forráselszámolási asszisztens / szakértő",
    "Támogatásmenedzsment referens",
    "Pályázatkezelési referens",
    "Pénzügyi referens",
    "Pénzügyi asszisztens / munkatárs",
    "Számlázási és kontírozási szakreferens"
  ],
  summary: "Több mint 4 éves tapasztalattal rendelkező projektpénzügyi referens, aki EU-s finanszírozású projektek pénzügyi menedzsmentjében és az EPTK-rendszer kezelésében szerzett mélyreható gyakorlati ismereteket. Pénzügyi-számviteli végzettséggel rendelkezik, önálló, precíz és elkötelezett szakember."
};

export const INITIAL_LEARNED_RULES: LearnedRule[] = [
  {
    id: "rule-eptk-boost",
    ruleType: "keyword_boost",
    pattern: "EPTK",
    adjustmentPoints: 25,
    explanation: "Erős előny: EPTK rendszer explicit említése az állásban (Hajnalka fő szakterülete).",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rule-project-finance-boost",
    ruleType: "keyword_boost",
    pattern: "projekt pénzügy",
    adjustmentPoints: 20,
    explanation: "Erős előny: Projekt pénzügyi és elszámolási feladatok.",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rule-eu-funds-boost",
    ruleType: "keyword_boost",
    pattern: "EU-s támogatás|pályázat|forráselszámolás",
    adjustmentPoints: 18,
    explanation: "Előny: Uniós pályázatok és forráselszámolási tapasztalat elvárása.",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rule-remote-hybrid-boost",
    ruleType: "keyword_boost",
    pattern: "home office|hibrid|távmunka",
    adjustmentPoints: 15,
    explanation: "Előny: Hibrid vagy Home Office lehetőség Hatvanból ingázáshoz.",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rule-english-c1-penalty",
    ruleType: "language_penalty",
    pattern: "felsőfokú angol|fluent english|tárgyalási szintű angol|c1 angol",
    adjustmentPoints: -30,
    explanation: "Büntetés: Magas szintű (tárgyalási / C1) angol elvárás, mivel Hajnalka angolja alapszintű.",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rule-sales-mlm-penalty",
    ruleType: "keyword_penalty",
    pattern: "értékesítő|biztosítási tanácsadó|hideghívás|ovb|jutalékos|call center",
    adjustmentPoints: -50,
    explanation: "Súlyos büntetés: Értékesítői, MLM vagy jutalékos állások kizárása.",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
