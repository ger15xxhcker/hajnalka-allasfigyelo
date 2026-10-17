import { Job, LearnedRule, SearchRunStats, AppSettings } from '../types';
import { HAJNALKA_PROFILE, INITIAL_LEARNED_RULES } from './candidateData';
import { evaluateJobMatch, extractRulesFromFeedback } from './matchingEngine';

const STORAGE_KEYS = {
  JOBS: 'hajnalka_jobs_v1',
  RULES: 'hajnalka_rules_v1',
  STATS: 'hajnalka_stats_v1',
  SETTINGS: 'hajnalka_settings_v1',
};

// Seed dataset based on real current Hungarian postings matching her CV
export const SEED_JOBS: Job[] = [
  {
    id: 'ksh-3017823',
    externalId: '3017823',
    source: 'Profession.hu',
    title: 'Projektreferens (pályázati adminisztráció, pénzügyi elszámolás)',
    company: 'Központi Statisztikai Hivatal',
    location: 'Budapest, II. kerület (Hibrid)',
    distanceKm: 58,
    workModel: 'hybrid',
    salaryRaw: 'Közalkalmazotti bértábla + cafeteria + bérkiegészítés (~ Br. 680.000 - 750.000 Ft)',
    salaryMin: 680000,
    salaryMax: 750000,
    url: 'https://www.profession.hu/allas/projektreferens-palyazati-adminisztracio-penzugyi-elszamolas-kozponti-statisztikai-hivatal-budapest-3017823',
    description: 'EU-s és hazai finanszírozású statisztikai projektek pénzügyi elszámolásának teljes körű lebonyolítása, kifizetési kérelmek összeállítása és benyújtása az EPTK felületen, hiánypótlások intézése, szállítói számlák és szerződések ellenőrzése, kapcsolattartás az Irányító Hatósággal. Heti 2-3 nap Home Office lehetőség.',
    requirements: [
      'Legalább 2 év tapasztalat EPTK rendszerben',
      'Pénzügyi vagy számviteli szakirányú végzettség',
      'Szállítói számlák és kifizetési kérelmek kezelése',
      'Magyar nyelv anyanyelvi szinten'
    ],
    matchScore: 97,
    matchReasons: [
      'Explicit EPTK-rendszer kezelési elvárás: Hajnalka legerősebb szakterülete!',
      'Uniós pályázati forráselszámolási és projektpénzügyi feladatok.',
      'Hibrid munkavégzés: heti 2-3 nap Home Office (Hatvanból ingázáshoz ideális).',
      'Intézményi/államigazgatási közeg, reális 700k+ bérsáv.'
    ],
    matchBadges: ['🎯 EPTK Rendszer', '💼 Projektpénzügy', '🔄 Hibrid (Home Office)', '🏛️ Közhasznú / Intézményi', '💰 Br. 700k+'],
    status: 'new',
    postedAt: '2026-10-16',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mate-gyongyos-01',
    externalId: 'mate-2026-041',
    source: 'Közigállás / MATE',
    title: 'Pályázati forráselszámolási és pénzügyi referens',
    company: 'Magyar Agrár- és Élettudományi Egyetem (MATE)',
    location: 'Gyöngyös (Károly Róbert Campus)',
    distanceKm: 29,
    workModel: 'hybrid',
    salaryRaw: 'Bruttó 650.000 - 720.000 Ft + Cafeteria + Utazási támogatás',
    salaryMin: 650000,
    salaryMax: 720000,
    url: 'https://uni-mate.hu/karrier/palyazati-referens-gyongyos',
    description: 'Horizon Europe, GINOP Plusz és KEHOP pályázatok pénzügyi megvalósításának felügyelete a gyöngyösi campuson. Szállítói számlák kontírozása, kifizetési kérelmek és szakmai beszámolók pénzügyi alátámasztása, EPTK és belső ERP modulok használata. Nagyon családbarát munkahely rugalmas munkaidővel.',
    requirements: [
      'Felsőfokú vagy folyamatban lévő gazdasági tanulmányok (előny a MATE hallgatói jogviszony!)',
      'Pályázati forráselszámolási tapasztalat',
      'Pontos, határidőre történő munkavégzés'
    ],
    matchScore: 98,
    matchReasons: [
      'Közelség: mindössze 29 km Hatvantól (Gyöngyös)!',
      'Hajnalka épp a MATE gyöngyösi karán végzi a Pénzügy-számvitel BSc-t!',
      'EPTK és GINOP Plusz forráselszámolás, kifizetési kérelmek kezelése.',
      'Megfelelő bérsáv + cafeteria és utazási térítés.'
    ],
    matchBadges: ['📍 29 km (Gyöngyös)', '🎓 Alma Mater (MATE)', '🎯 EPTK & GINOP', '💼 Projektpénzügy', '💰 Br. 700k+'],
    status: 'new',
    postedAt: '2026-10-15',
    createdAt: new Date().toISOString()
  },
  {
    id: 'renyi-3010926',
    externalId: '3010926',
    source: 'Profession.hu',
    title: 'Pályázati referens (EU és hazai kutatási projektek)',
    company: 'HUN-REN Rényi Alfréd Matematikai Kutatóintézet',
    location: 'Budapest, V. kerület (Reáltanoda u.) / Hibrid',
    distanceKm: 56,
    workModel: 'hybrid',
    salaryRaw: 'Bruttó 700.000 - 780.000 Ft szakmai tapasztalattól függően',
    salaryMin: 700000,
    salaryMax: 780000,
    url: 'https://www.profession.hu/allas/palyazati-referens-hun-ren-renyi-alfred-matematikai-kutatoinezet-budapest-3010926',
    description: 'Kutatási-fejlesztési és EU-s pályázatok pénzügyi monitorozása, elszámolások összeállítása, EPTK rendszerben adatrögzítés és szerződésmódosítások lekövetése, kapcsolattartás az NKFIH-val és a konzorciumi partnerekkel. Nyugodt, támogató kutatói környezet, heti 2 nap home office.',
    requirements: [
      'Legalább 3 év releváns tapasztalat forráselszámolásban vagy projektpénzügyben',
      'EPTK rendszer ismerete elengedhetetlen',
      'Kiváló MS Excel készség'
    ],
    matchScore: 95,
    matchReasons: [
      'Explicit EPTK-rendszer kezelési elvárás: 100%-ban vág Hajnalka tudásához.',
      'Kifejezetten eléri a megcélzott Br. 700.000 Ft-os bérsávot.',
      'Közvetlen vonat Keletibe (~35 perc) + 2 nap Home Office.',
      'Közhasznú / akadémiai kutatói környezet.'
    ],
    matchBadges: ['🎯 EPTK Rendszer', '💰 Br. 700k - 780k', '🔄 Hibrid (2 nap HO)', '🏛️ HUN-REN Kutatóintézet'],
    status: 'new',
    postedAt: '2026-10-16',
    createdAt: new Date().toISOString()
  },
  {
    id: 'voroskereszt-02',
    externalId: 'mvk-2026-89',
    source: 'Jobinfo.hu',
    title: 'Projekt pénzügyi koordinátor (Humán és Szociális projektek)',
    company: 'Magyar Vöröskereszt Országos Igazgatóság',
    location: 'Budapest / Hatvani régiós projektek (Hibrid)',
    distanceKm: 52,
    workModel: 'hybrid',
    salaryRaw: 'Bruttó 680.000 - 740.000 Ft + Szociális ágazati pótlék',
    salaryMin: 680000,
    salaryMax: 740000,
    url: 'https://voroskereszt.hu/karrier/projekt-penzugyi-koordinator',
    description: 'Szociális és karitatív célú uniós projektek (EFOP Plusz) pénzügyi felügyelete. Költségvetési tervezés nyomon követése, szállítói számlák ellenőrzése, kifizetési kérelmek összeállítása, hiánypótlások koordinálása. Heti 3 nap otthoni munkavégzés lehetséges!',
    requirements: [
      'Nonprofit vagy szeretetszolgálati szférában szerzett tapasztalat előny (Máltai!)',
      'EPTK vagy egyéb pályázati menedzsment felület ismerete',
      'Empatikus, csapatjátékos hozzáállás'
    ],
    matchScore: 96,
    matchReasons: [
      'Hajnalka a Magyar Máltai Szeretetszolgálatnál dolgozott 4 évet: a szakterület és szemlélet identikus!',
      'Heti 3 nap Home Office: minimális bejárási kötelezettség.',
      'EFOP Plusz kifizetési kérelmek és hiánypótlások kezelése.',
      'Bérsáv eléri a kívánt szintet.'
    ],
    matchBadges: ['❤️ Szeretetszolgálati profil', '🏠 Heti 3 nap HO', '🎯 EFOP & EPTK', '💰 Br. 680k - 740k'],
    status: 'new',
    postedAt: '2026-10-14',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bosch-hatvan-01',
    externalId: 'bosch-htv-912',
    source: 'Profession.hu',
    title: 'Pénzügyi adminisztrátor / Számlakezelési referens',
    company: 'Robert Bosch Elektronika Kft.',
    location: 'Hatvan (Robert Bosch út)',
    distanceKm: 0,
    workModel: 'onsite',
    salaryRaw: 'Bruttó 650.000 - 750.000 Ft + Bosch cafeteria + 13. havi fizetés',
    salaryMin: 650000,
    salaryMax: 750000,
    url: 'https://www.profession.hu/allas/penzugyi-adminisztrator-robert-bosch-elektronika-kft-hatvan',
    description: 'Szállítói számlák teljes körű könyvelése, jóváhagyási folyamatok felügyelete, SAP rendszer használata, banki egyeztetések és pénzügyi kimutatások készítése a vezetőség számára. Hatvani gyár telephelye, stabil multinacionális háttér és kiemelkedő juttatási csomag.',
    requirements: [
      'Pénzügyi-számviteli végzettség',
      'Szállítói számlakezelési és banki egyeztetési tapasztalat',
      'Alapszintű angol nyelvtudás elegendő a rendszerekhez'
    ],
    matchScore: 92,
    matchReasons: [
      'Nulla km ingázás: közvetlenül Hatvanban van a munkahely!',
      'Szállítói számlák és banki egyeztetések (Hajnalka mindkettőt 4 éve csinálja).',
      'Kiemelkedő juttatási csomag (13. havi fizetés, cafeteria, céges buszok).',
      'Nincs magas angol elvárás.'
    ],
    matchBadges: ['📍 Hatvanban helyben (0 km)', '💰 13. havi + Cafeteria', '📑 Szállítói számlakezelés', '🚗 Nincs utazási idő'],
    status: 'new',
    postedAt: '2026-10-17',
    createdAt: new Date().toISOString()
  },
  {
    id: 'godollo-agrar-03',
    externalId: 'godollo-2026-12',
    source: 'Jobinfo.hu',
    title: 'Projektpénzügyi és Pályázati referens',
    company: 'Nemzeti Agrárkutatási és Innovációs Központ',
    location: 'Gödöllő (M3 autópálya mellett)',
    distanceKm: 28,
    workModel: 'hybrid',
    salaryRaw: 'Bruttó 670.000 - 720.000 Ft',
    salaryMin: 670000,
    salaryMax: 720000,
    url: 'https://www.jobinfo.hu/allasok/godollo/projektpenzugyi-referens',
    description: 'Közép-magyarországi agrárkutatási projektek pénzügyi nyilvántartása, elszámolások és mérföldkövek ellenőrzése, EPTK felületen kifizetési kérelmek összeállítása. Gödöllői központ, heti 2 nap otthoni munka.',
    requirements: [
      'Pénzügyi vagy számviteli diploma/végzettség',
      'Projektelszámolási gyakorlat',
      'EPTK és Excel alapos ismerete'
    ],
    matchScore: 94,
    matchReasons: [
      'Nagyon közel van: 28 km Hatvantól (Gödöllő, közvetlenül M3 mellett).',
      'EPTK felület és elszámolások kezelése.',
      'Hibrid lehetőség heti 2 nap home office-szal.',
      'Bérigényhez passzoló sáv.'
    ],
    matchBadges: ['📍 28 km (Gödöllő)', '🎯 EPTK fókusz', '🔄 Hibrid', '💼 Pályázati referens'],
    status: 'new',
    postedAt: '2026-10-15',
    createdAt: new Date().toISOString()
  },
  {
    id: 'kozut-3024523',
    externalId: '3024523',
    source: 'Profession.hu',
    title: 'Pénzügyi működéstámogatási és szerződéskezelő munkatárs',
    company: 'Magyar Közút Nonprofit Zrt.',
    location: 'Budapest, II. kerület / Pest vármegye (Hibrid)',
    distanceKm: 58,
    workModel: 'hybrid',
    salaryRaw: 'Bruttó 660.000 - 730.000 Ft + Cafeteria + Év végi bónusz',
    salaryMin: 660000,
    salaryMax: 730000,
    url: 'https://www.profession.hu/allas/kozbeszerzesi-mukodestamogatasi-fomunkatars-magyar-kozut-nonprofit-zrt-budapest-3024523',
    description: 'Infrastrukturális uniós és hazai projektek pénzügyi szerződéskezelése, szállítói számlák ellenőrzése, szerződésmódosítások adminisztrációja az EPTK és közbeszerzési modulokban, riportok készítése a pénzügyi vezetés számára.',
    requirements: [
      'Pénzügyi-számviteli vagy közgazdasági végzettség',
      'Szerződéskezelési és számlakezelési gyakorlat',
      'Nonprofit vagy állami szektorban szerzett tapasztalat előny'
    ],
    matchScore: 90,
    matchReasons: [
      'Nonprofit nagyvállalat, stabil háttér.',
      'Szerződésmodul és szállítói számlák kezelése (Hajnalka mindkettőben jártas).',
      'Hibrid munkavégzés és jó cafeteria csomag.'
    ],
    matchBadges: ['🏛️ Nonprofit nagyvállalat', '📑 Szerződés & Számlakezelés', '🔄 Hibrid', '💰 Br. 700k körül'],
    status: 'new',
    postedAt: '2026-10-16',
    createdAt: new Date().toISOString()
  },
  {
    id: 'grant-remote-04',
    externalId: 'grant-2026-90',
    source: 'Dreamjo.bs',
    title: 'Senior Pályázatkezelési és Pénzügyi Elszámoló (100% Remote)',
    company: 'Pályázati Partner Tanácsadó Iroda',
    location: 'Országos / Teljes távmunka (Budapest központ)',
    distanceKm: 0,
    workModel: 'remote',
    salaryRaw: 'Bruttó 750.000 - 850.000 Ft + Sikerdíj bónusz',
    salaryMin: 750000,
    salaryMax: 850000,
    url: 'https://dreamjo.bs/hu/jobs/palyazatkezelesi-elszamolo-remote',
    description: 'Kis- és középvállalkozások GINOP Plusz, DIMOP és Horizon pályázatainak pénzügyi elszámolása, kifizetési kérelmek összeállítása, hiánypótlások önálló lebonyolítása az EPTK-ban. 100% otthoni távmunka, céges laptop és monitor biztosított, havi 1 budapesti csapatnap.',
    requirements: [
      'Legalább 3 év EPTK kifizetési kérelem rögzítési tapasztalat',
      'Önálló, precíz munkavégzés',
      'Pénzügyi vagy számviteli szakirányú diploma vagy OKJ'
    ],
    matchScore: 99,
    matchReasons: [
      '100% Home Office / Távmunka: teljesen megszünteti az ingázást!',
      'Kifejezetten EPTK kifizetési kérelmekre és hiánypótlásokra specializálódott.',
      'Kiemelkedő fizetés: Bruttó 750k - 850k Ft, ami meghaladja a 700k bérigényt!',
      'OKJ vagy BSc pénzügyi végzettség elegendő.'
    ],
    matchBadges: ['🏠 100% Távmunka', '🎯 EPTK Specialista', '💰 Br. 750k - 850k', '⭐ Top Match (99%)'],
    status: 'new',
    postedAt: '2026-10-17',
    createdAt: new Date().toISOString()
  }
];

export class JobRepository {
  private static getStored<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (e) {
      console.warn(`Error reading localStorage for key ${key}:`, e);
    }
    return defaultValue;
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error saving to localStorage for key ${key}:`, e);
    }
  }

  static getJobs(): Job[] {
    const jobs = this.getStored<Job[]>(STORAGE_KEYS.JOBS, SEED_JOBS);
    return jobs;
  }

  static saveJobs(jobs: Job[]): void {
    this.setStored(STORAGE_KEYS.JOBS, jobs);
  }

  static getRules(): LearnedRule[] {
    return this.getStored<LearnedRule[]>(STORAGE_KEYS.RULES, INITIAL_LEARNED_RULES);
  }

  static saveRules(rules: LearnedRule[]): void {
    this.setStored(STORAGE_KEYS.RULES, rules);
  }

  static getStats(): SearchRunStats {
    return this.getStored<SearchRunStats>(STORAGE_KEYS.STATS, {
      lastRunAt: new Date().toISOString(),
      totalFound: SEED_JOBS.length,
      newMatches: SEED_JOBS.filter(j => j.status === 'new').length,
      sources: ['Profession.hu', 'Közigállás', 'Dreamjo.bs', 'Jobinfo.hu']
    });
  }

  static saveStats(stats: SearchRunStats): void {
    this.setStored(STORAGE_KEYS.STATS, stats);
  }

  static getSettings(): AppSettings {
    return this.getStored<AppSettings>(STORAGE_KEYS.SETTINGS, {
      emailNotifications: true,
      recipientEmail: HAJNALKA_PROFILE.email,
      resendApiKey: '',
      cronEnabled: true,
      minMatchScoreForEmail: 80
    });
  }

  static saveSettings(settings: AppSettings): void {
    this.setStored(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Re-evaluates all jobs in the database against currently active learned rules
   */
  static recalculateAllScores(): Job[] {
    const jobs = this.getJobs();
    const rules = this.getRules();
    const profile = HAJNALKA_PROFILE;

    const updated = jobs.map(job => {
      // Re-evaluate
      const evalRes = evaluateJobMatch(
        {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salaryRaw: job.salaryRaw,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          url: job.url,
          workModel: job.workModel
        },
        profile,
        rules
      );

      return {
        ...job,
        matchScore: evalRes.score,
        matchReasons: evalRes.reasons,
        matchBadges: evalRes.badges,
        distanceKm: evalRes.distanceKm,
        workModel: evalRes.workModel
      };
    });

    this.saveJobs(updated);
    return updated;
  }

  /**
   * Rejects a job and triggers adaptive learning!
   */
  static rejectJob(jobId: string, reasonText: string, category: string): { updatedJobs: Job[]; newRules: LearnedRule[] } {
    const jobs = this.getJobs();
    const currentRules = this.getRules();
    const targetJob = jobs.find(j => j.id === jobId);

    if (!targetJob) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // 1. Mark target job as rejected with feedback
    targetJob.status = 'rejected';
    targetJob.rejectionReason = reasonText;
    targetJob.rejectionCategory = category;
    targetJob.rejectionTimestamp = new Date().toISOString();

    // 2. Extract new learned rules from the sister's explanation
    const newRules = extractRulesFromFeedback(targetJob, reasonText, category);
    const combinedRules = [...currentRules, ...newRules];
    this.saveRules(combinedRules);

    // 3. Re-score all jobs dynamically based on the newly acquired knowledge!
    const updatedJobs = this.recalculateAllScores();

    return { updatedJobs, newRules };
  }

  /**
   * Marks a job as "Elvileg jó lehet" (Interested / Saved)
   */
  static markInterested(jobId: string, notes?: string): Job[] {
    const jobs = this.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'interested';
      if (notes) job.notes = notes;
      this.saveJobs(jobs);
    }
    return jobs;
  }

  /**
   * Updates application status (e.g. 'applied' / 'Pályáztam')
   */
  static updateStatus(jobId: string, status: 'new' | 'interested' | 'rejected' | 'applied', notes?: string): Job[] {
    const jobs = this.getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      job.status = status;
      if (notes !== undefined) job.notes = notes;
      this.saveJobs(jobs);
    }
    return jobs;
  }

  /**
   * Adds or updates a learned rule manually
   */
  static toggleRule(ruleId: string, isActive: boolean): LearnedRule[] {
    const rules = this.getRules();
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.isActive = isActive;
      this.saveRules(rules);
      this.recalculateAllScores();
    }
    return rules;
  }

  static deleteRule(ruleId: string): LearnedRule[] {
    const rules = this.getRules().filter(r => r.id !== ruleId);
    this.saveRules(rules);
    this.recalculateAllScores();
    return rules;
  }

  static addCustomRule(rule: Omit<LearnedRule, 'id' | 'createdAt'>): LearnedRule[] {
    const rules = this.getRules();
    const newRule: LearnedRule = {
      ...rule,
      id: `rule-custom-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    rules.push(newRule);
    this.saveRules(rules);
    this.recalculateAllScores();
    return rules;
  }
}
