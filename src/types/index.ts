export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  baseLocation: string;
  maxDistanceKm: number;
  targetSalaryGross: number;
  englishLevel: 'alap' | 'közép' | 'felső';
  experienceYears: number;
  coreStrengths: string[];
  targetTitles: string[];
  summary: string;
}

export type JobStatus = 'new' | 'interested' | 'rejected' | 'applied';
export type WorkModel = 'remote' | 'hybrid' | 'onsite' | 'unknown';

export interface Job {
  id: string;
  externalId?: string;
  source: string;
  title: string;
  company: string;
  location: string;
  distanceKm: number;
  salaryRaw?: string;
  salaryMin?: number;
  salaryMax?: number;
  workModel: WorkModel;
  url: string;
  description: string;
  requirements?: string[];
  matchScore: number; // 0 - 100
  matchReasons: string[];
  matchBadges: string[];
  status: JobStatus;
  rejectionReason?: string;
  rejectionCategory?: string;
  rejectionTimestamp?: string;
  notes?: string;
  postedAt: string;
  createdAt: string;
}

export type RuleType = 
  | 'keyword_penalty' 
  | 'keyword_boost' 
  | 'location_penalty' 
  | 'company_block' 
  | 'salary_threshold' 
  | 'language_penalty' 
  | 'custom';

export interface LearnedRule {
  id: string;
  ruleType: RuleType;
  pattern: string;
  adjustmentPoints: number; // e.g. -35 or +20
  explanation: string;
  originFeedback?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RejectionPayload {
  jobId: string;
  reasonText: string;
  category: string;
}

export interface SearchRunStats {
  lastRunAt: string;
  totalFound: number;
  newMatches: number;
  sources: string[];
}

export interface AppSettings {
  emailNotifications: boolean;
  recipientEmail: string;
  resendApiKey: string;
  cronEnabled: boolean;
  minMatchScoreForEmail: number;
}
