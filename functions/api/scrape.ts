// Cloudflare Pages Function: /api/scrape
// Server-side aggregator for Hungarian job portals

interface Env {
  DB?: any;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { env } = context;

  const queries = [
    'eptk',
    'projekt+pénzügyi',
    'pályázati+elszámoló',
    'forráselszámolás',
    'támogatásmenedzsment'
  ];

  const scrapedJobs: any[] = [];
  const seenIds = new Set<string>();

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  };

  for (const q of queries) {
    try {
      const url = `https://www.profession.hu/allasok/1,0,0,${encodeURIComponent(q)}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) continue;

      const html = await resp.text();

      // Extract dataLayer ecommerce items
      const match = html.match(/"ecommerce"\s*:\s*\{"currency":"HUF","items":(\[.*?\])\}/s);
      if (match && match[1]) {
        try {
          const items = JSON.parse(match[1]);
          for (const item of items) {
            const externalId = String(item.item_id || '');
            if (!externalId || seenIds.has(externalId)) continue;
            seenIds.add(externalId);

            const title = item.item_name || 'Állásajánlat';
            const company = item.affiliation || 'Munkaadó';
            let loc = (item.location_id || 'Budapest és környéke').replace(/_/g, ' ');

            // Calculate basic distance estimate
            let distanceKm = 55;
            let workModel = 'onsite';
            const lowerTitle = title.toLowerCase();

            if (lowerTitle.includes('remote') || lowerTitle.includes('távmunka') || lowerTitle.includes('home office')) {
              workModel = 'remote';
              distanceKm = 0;
            } else if (loc.toLowerCase().includes('hatvan')) {
              distanceKm = 0;
            } else if (loc.toLowerCase().includes('gyöngyös')) {
              distanceKm = 29;
            } else if (loc.toLowerCase().includes('gödöllő')) {
              distanceKm = 28;
            } else if (loc.toLowerCase().includes('budapest')) {
              distanceKm = 55;
            }

            // Simple match score calculation
            let matchScore = 75;
            const reasons: string[] = [];
            const badges: string[] = [];

            if (lowerTitle.includes('eptk') || q === 'eptk') {
              matchScore += 20;
              badges.push('🎯 EPTK fókusz');
              reasons.push('EPTK rendszerhez kapcsolódó feladatkör.');
            }
            if (lowerTitle.includes('projekt') || lowerTitle.includes('pályázat')) {
              matchScore += 10;
              badges.push('💼 Pályázati elszámolás');
              reasons.push('Projekt- és forráselszámolási munkakör.');
            }
            if (distanceKm <= 35) {
              matchScore += 10;
              badges.push(`📍 ${distanceKm} km`);
            }

            matchScore = Math.min(100, Math.max(0, matchScore));

            scrapedJobs.push({
              id: `prof-${externalId}`,
              externalId,
              source: 'Profession.hu',
              title,
              company,
              location: loc,
              distanceKm,
              workModel,
              url: `https://www.profession.hu/allas/${externalId}`,
              description: `${company} munkatársat keres "${title}" pozícióba. Részletek a Profession.hu adatlapon.`,
              matchScore,
              matchReasons: reasons,
              matchBadges: badges,
              status: 'new',
              postedAt: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString()
            });
          }
        } catch (parseErr) {
          console.error('Error parsing ecommerce items:', parseErr);
        }
      }
    } catch (fetchErr) {
      console.error(`Error scraping query ${q}:`, fetchErr);
    }
  }

  // If Cloudflare D1 DB is bound, persist new items
  if (env.DB) {
    for (const job of scrapedJobs) {
      try {
        await env.DB.prepare(`
          INSERT OR IGNORE INTO jobs 
          (id, external_id, source, title, company, location, distance_km, work_model, url, description, match_score, match_reasons, match_badges, status, posted_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          job.id,
          job.externalId,
          job.source,
          job.title,
          job.company,
          job.location,
          job.distanceKm,
          job.workModel,
          job.url,
          job.description,
          job.matchScore,
          JSON.stringify(job.matchReasons),
          JSON.stringify(job.matchBadges),
          job.status,
          job.postedAt
        ).run();
      } catch (dbErr) {
        console.error('DB insert error:', dbErr);
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    totalScraped: scrapedJobs.length,
    jobs: scrapedJobs
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
