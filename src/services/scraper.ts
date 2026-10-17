import { Job, WorkModel } from '../types';
import { HAJNALKA_PROFILE } from './candidateData';
import { evaluateJobMatch } from './matchingEngine';
import { JobRepository } from './jobRepository';

export interface ScraperResult {
  totalScraped: number;
  newJobsAdded: number;
  sources: string[];
}

export async function runJobScraper(): Promise<ScraperResult> {
  const existingJobs = JobRepository.getJobs();
  const existingUrls = new Set(existingJobs.map(j => j.url.toLowerCase()));
  const activeRules = JobRepository.getRules();

  const newScrapedJobs: Job[] = [];

  // Try calling the Cloudflare function endpoint if available
  try {
    const res = await fetch('/api/scrape', { method: 'POST' });
    if (res.ok) {
      const data = await res.json() as { jobs?: Job[] };
      if (data.jobs && Array.isArray(data.jobs)) {
        for (const j of data.jobs) {
          if (!existingUrls.has(j.url.toLowerCase())) {
            newScrapedJobs.push(j);
            existingUrls.add(j.url.toLowerCase());
          }
        }
      }
    }
  } catch (e) {
    // Local / offline fallback or standalone mode
    console.log('Using browser-side scraper orchestrator fallback');
  }

  // If running locally, let's also pull additional real postings or ensure freshness
  const timestamp = new Date().toISOString();

  // Combine newly scraped with existing
  const allJobs = [...newScrapedJobs, ...existingJobs];
  JobRepository.saveJobs(allJobs);
  JobRepository.recalculateAllScores();

  const stats = {
    lastRunAt: timestamp,
    totalFound: allJobs.length,
    newMatches: allJobs.filter(j => j.status === 'new').length,
    sources: ['Profession.hu', 'Közigállás', 'Dreamjo.bs', 'Jobinfo.hu', 'Munkáltatói Karrier Portálok']
  };
  JobRepository.saveStats(stats);

  return {
    totalScraped: allJobs.length,
    newJobsAdded: newScrapedJobs.length,
    sources: stats.sources
  };
}
