// Distance calculation relative to Hatvan (47.6697° N, 19.6833° E)

const KNOWN_DISTANCES_FROM_HATVAN: Record<string, number> = {
  "hatvan": 0,
  "lőrinci": 10,
  "lorinci": 10,
  "tura": 11,
  "hort": 8,
  "boldog": 9,
  "kartal": 16,
  "aszód": 17,
  "aszod": 17,
  "bátonyterenye": 48,
  "batonyterenye": 48,
  "pásztó": 38,
  "paszto": 38,
  "gödöllő": 28,
  "godollo": 28,
  "gyöngyös": 29,
  "gyongyos": 29,
  "jászberény": 34,
  "jaszbereny": 34,
  "nagykáta": 42,
  "nagydata": 42,
  "vác": 52,
  "vac": 52,
  "dunakeszi": 48,
  "fót": 44,
  "fot": 44,
  "göd": 50,
  "god": 50,
  "csomád": 40,
  "veresegyház": 35,
  "veresegyhaz": 35,
  "salgótarján": 68,
  "salgotarjan": 68,
  "balassagyarmat": 75,
  "eger": 75,
  "füzesabony": 65,
  "fuzesabony": 65,
  "cegléd": 75,
  "cegled": 75,
  "szolnok": 85,
  "monor": 58,
  "vecsés": 55,
  "vecses": 55,
  "gyál": 58,
  "gyal": 58,
  "maglód": 45,
  "maglod": 45,
  "budaörs": 68,
  "budaors": 68,
  "szentendre": 65,
  "százhalombatta": 82,
  "szazhalombatta": 82,
  "érd": 75,
  "erd": 75,
  "budapest": 55,
  "pest megye": 50,
  "heves": 45,
  "heves megye": 40,
  "nógrád": 60,
  "nograd": 60,
  "jász-nagykun-szolnok": 75,
  "jasz-nagykun-szolnok": 75,
  // Distances over 100km
  "miskolc": 115,
  "debrecen": 175,
  "nyíregyháza": 180,
  "nyiregyhaza": 180,
  "szeged": 190,
  "kecskemét": 105,
  "kecskemet": 105,
  "székesfehérvár": 120,
  "szekesfehervar": 120,
  "tatabánya": 115,
  "tatabanya": 115,
  "győr": 175,
  "gyor": 175,
  "pécs": 255,
  "pecs": 255,
};

export function estimateDistanceFromHatvan(locationStr: string, isRemote: boolean = false): { distanceKm: number; isWithin100Km: boolean; note?: string } {
  if (isRemote) {
    return { distanceKm: 0, isWithin100Km: true, note: "Home Office / Távmunka" };
  }

  if (!locationStr || typeof locationStr !== "string") {
    // default to Budapest region if unspecified
    return { distanceKm: 55, isWithin100Km: true, note: "Becsült (Közép-Magyarország)" };
  }

  const normalized = locationStr.toLowerCase().replace(/_/g, " ").trim();

  if (normalized.includes("remote") || normalized.includes("távmunka") || normalized.includes("otthonról") || normalized.includes("home office")) {
    return { distanceKm: 0, isWithin100Km: true, note: "Home Office / Távmunka" };
  }

  // Check Budapest districts
  if (normalized.includes("budapest") || normalized.includes("bp.")) {
    // Check specific districts if mentioned
    if (normalized.includes("14. ker") || normalized.includes("xiv.") || normalized.includes("zugló") || 
        normalized.includes("15. ker") || normalized.includes("xv.") || 
        normalized.includes("16. ker") || normalized.includes("xvi.")) {
      return { distanceKm: 50, isWithin100Km: true, note: "M3 bevezető, Kelet-Pest" };
    }
    if (normalized.includes("11. ker") || normalized.includes("xi.") || normalized.includes("újbuda") ||
        normalized.includes("12. ker") || normalized.includes("xii.") ||
        normalized.includes("22. ker") || normalized.includes("xxii.")) {
      return { distanceKm: 70, isWithin100Km: true, note: "Dél-Buda" };
    }
    return { distanceKm: 55, isWithin100Km: true, note: "Budapest (M3 / Vonat)" };
  }

  // Check known map
  for (const [key, dist] of Object.entries(KNOWN_DISTANCES_FROM_HATVAN)) {
    if (normalized.includes(key)) {
      return {
        distanceKm: dist,
        isWithin100Km: dist <= 100,
        note: dist <= 100 ? `${dist} km Hatvantól` : `Túl messze (${dist} km)`
      };
    }
  }

  // Heves, Pest county generic
  if (normalized.includes("heves") || normalized.includes("pest")) {
    return { distanceKm: 45, isWithin100Km: true, note: "Környező megye" };
  }

  // Fallback default: assume 60km unless obviously western or far eastern
  return { distanceKm: 60, isWithin100Km: true, note: "Hatvan vonzáskörzet" };
}
