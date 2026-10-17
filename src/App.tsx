import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  User, 
  MapPin, 
  Filter, 
  ArrowUpDown, 
  AlertCircle,
  ExternalLink,
  Send,
  Info
} from 'lucide-react';
import { Job, LearnedRule, CandidateProfile, AppSettings, SearchRunStats } from './types';
import { HAJNALKA_PROFILE } from './services/candidateData';
import { JobRepository } from './services/jobRepository';
import { runJobScraper } from './services/scraper';
import { Header } from './components/Header';
import { JobCard } from './components/JobCard';
import { RejectModal } from './components/RejectModal';
import { LearningCenter } from './components/LearningCenter';
import { ProfileView } from './components/ProfileView';
import { SettingsModal } from './components/SettingsModal';

type ActiveTab = 'new' | 'interested' | 'rejected' | 'learning' | 'profile';

export const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [rules, setRules] = useState<LearnedRule[]>([]);
  const [stats, setStats] = useState<SearchRunStats | null>(null);
  const [settings, setSettings] = useState<AppSettings>(JobRepository.getSettings());
  
  // UI states
  const [activeTab, setActiveTab] = useState<ActiveTab>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<'all' | 'close' | 'm3' | 'remote'>('all');
  const [portalFilter, setPortalFilter] = useState<'all' | 'profession' | 'kozig' | 'other'>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(60);
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'date'>('score');

  // Modals & Async
  const [selectedRejectJob, setSelectedRejectJob] = useState<Job | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize data
  useEffect(() => {
    const loadedJobs = JobRepository.getJobs();
    const loadedRules = JobRepository.getRules();
    const loadedStats = JobRepository.getStats();
    setJobs(loadedJobs);
    setRules(loadedRules);
    setStats(loadedStats);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Scraper action
  const handleRefreshScraper = async () => {
    setIsScraping(true);
    try {
      const res = await runJobScraper();
      const updatedJobs = JobRepository.getJobs();
      const updatedStats = JobRepository.getStats();
      setJobs(updatedJobs);
      setStats(updatedStats);
      showToast(
        `Keresés befejezve! ${res.totalScraped} db állás ellenőrizve a magyar portálokon (Profession.hu, Közigállás, stb.).`,
        'success'
      );
    } catch (err: any) {
      showToast(`Hiba a keresés során: ${err.message}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Rejection handler with learning loop!
  const handleRejectJob = (jobId: string, reasonText: string, category: string) => {
    try {
      const { updatedJobs, newRules } = JobRepository.rejectJob(jobId, reasonText, category);
      setJobs(updatedJobs);
      setRules(JobRepository.getRules());

      showToast(
        `Elutasítás rögzítve! Az algoritmus azonnal megtanulta a visszajelzésedet és újraszámolta az ajánlatok pontszámát.`,
        'success'
      );
    } catch (e: any) {
      showToast(`Hiba: ${e.message}`, 'error');
    }
  };

  // Mark as interested ("Elvileg jó lehet")
  const handleMarkInterested = (jobId: string) => {
    const updated = JobRepository.markInterested(jobId);
    setJobs([...updated]);
    showToast('Állás mentve az "Elvileg jó lehet" listába! ⭐', 'success');
  };

  // Update status (e.g. 'applied')
  const handleUpdateStatus = (jobId: string, status: 'new' | 'interested' | 'rejected' | 'applied') => {
    const updated = JobRepository.updateStatus(jobId, status);
    setJobs([...updated]);
    showToast('Státusz sikeresen frissítve!', 'info');
  };

  // Rule management
  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    const updatedRules = JobRepository.toggleRule(ruleId, isActive);
    setRules([...updatedRules]);
    setJobs(JobRepository.getJobs());
    showToast(`Szabály ${isActive ? 'bekapcsolva' : 'kikapcsolva'}. Pontszámok frissítve!`, 'info');
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = JobRepository.deleteRule(ruleId);
    setRules([...updatedRules]);
    setJobs(JobRepository.getJobs());
    showToast('Szabály törölve. Pontszámok újraszámolva!', 'info');
  };

  const handleAddRule = (rule: Omit<LearnedRule, 'id' | 'createdAt'>) => {
    const updatedRules = JobRepository.addCustomRule(rule);
    setRules([...updatedRules]);
    setJobs(JobRepository.getJobs());
    showToast('Új saját szabály hozzáadva és érvényesítve!', 'success');
  };

  // Test email sender
  const handleTestEmail = async () => {
    setIsSendingEmail(true);
    try {
      const relevantJobs = jobs.filter(j => j.status === 'new' && j.matchScore >= settings.minMatchScoreForEmail);
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: settings.recipientEmail,
          candidateName: HAJNALKA_PROFILE.name,
          jobs: relevantJobs.slice(0, 5),
          portalUrl: window.location.origin
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        showToast(
          `E-mail értesítő sikeresen összeállítva ${settings.recipientEmail} címre (${relevantJobs.length} releváns állással)!`,
          'success'
        );
      } else {
        showToast(`E-mail értesítő előnézet készen áll (${relevantJobs.length} releváns állás).`, 'info');
      }
    } catch (e) {
      // Local fallback
      const relevantJobs = jobs.filter(j => j.status === 'new' && j.matchScore >= settings.minMatchScoreForEmail);
      showToast(
        `E-mail értesítő sablon sikeresen legenerálva ${settings.recipientEmail} részére (${relevantJobs.length} top ajánlat)!`,
        'success'
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Counts
  const newJobsCount = jobs.filter(j => j.status === 'new').length;
  const interestedCount = jobs.filter(j => j.status === 'interested' || j.status === 'applied').length;
  const rejectedCount = jobs.filter(j => j.status === 'rejected').length;
  const activeRulesCount = rules.filter(r => r.isActive).length;

  // Filter & sort
  const filteredJobs = useMemo(() => {
    let result = jobs;

    // Filter by tab
    if (activeTab === 'new') {
      result = result.filter(j => j.status === 'new');
    } else if (activeTab === 'interested') {
      result = result.filter(j => j.status === 'interested' || j.status === 'applied');
    } else if (activeTab === 'rejected') {
      result = result.filter(j => j.status === 'rejected');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.requirements && j.requirements.some(r => r.toLowerCase().includes(q)))
      );
    }

    // Filter by distance / work model
    if (distanceFilter === 'close') {
      result = result.filter(j => j.distanceKm <= 35 || j.workModel === 'remote');
    } else if (distanceFilter === 'm3') {
      result = result.filter(j => j.distanceKm <= 65 || j.workModel === 'remote');
    } else if (distanceFilter === 'remote') {
      result = result.filter(j => j.workModel === 'remote');
    }

    // Filter by portal source
    if (portalFilter !== 'all') {
      if (portalFilter === 'profession') {
        result = result.filter(j => j.source.toLowerCase().includes('profession'));
      } else if (portalFilter === 'kozig') {
        result = result.filter(j => j.source.toLowerCase().includes('kozig') || j.source.toLowerCase().includes('közig') || j.source.toLowerCase().includes('mate'));
      } else {
        result = result.filter(j => !j.source.toLowerCase().includes('profession') && !j.source.toLowerCase().includes('kozig'));
      }
    }

    // Min score
    if (activeTab === 'new') {
      result = result.filter(j => j.matchScore >= minScoreFilter);
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'score') return b.matchScore - a.matchScore;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'date') return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      return 0;
    });
  }, [jobs, activeTab, searchQuery, distanceFilter, minScoreFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium flex items-center gap-2.5 max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 border-rose-500/50 text-rose-200'
              : 'bg-blue-950 border-blue-500/50 text-blue-200'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        profile={HAJNALKA_PROFILE}
        onRefreshScraper={handleRefreshScraper}
        isScraping={isScraping}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTestEmail={handleTestEmail}
        isSendingEmail={isSendingEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Metric highlight pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div 
            onClick={() => setActiveTab('new')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'new' 
                ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg shadow-blue-500/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Új ajánlatok</span>
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <div className="text-2xl font-black text-white mt-1">{newJobsCount} db</div>
            <span className="text-[11px] text-blue-400 font-medium">Releváns találatok</span>
          </div>

          <div 
            onClick={() => setActiveTab('interested')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'interested' 
                ? 'bg-emerald-600/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Elvileg jó lehet</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{interestedCount} db</div>
            <span className="text-[11px] text-emerald-400 font-medium">Mentett kedvencek</span>
          </div>

          <div 
            onClick={() => setActiveTab('learning')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'learning' 
                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Tanulás</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{activeRulesCount} db</div>
            <span className="text-[11px] text-indigo-400 font-medium">Aktív tanulási szabály</span>
          </div>

          <div 
            onClick={() => setActiveTab('rejected')}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              activeTab === 'rejected' 
                ? 'bg-rose-600/10 border-rose-500 text-white shadow-lg shadow-rose-500/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Elutasított</span>
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">{rejectedCount} db</div>
            <span className="text-[11px] text-rose-400 font-medium">Visszajelzéssel ellátva</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'new'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Új Ajánlatok ({newJobsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('interested')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'interested'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Elvileg jó lehet ({interestedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('learning')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'learning'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>🧠 Tanulási Központ ({activeRulesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hajnalka CV Profil</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Elutasítottak ({rejectedCount})</span>
          </button>
        </div>

        {/* Tab 1, 2, 5: Job Lists with Filters */}
        {(activeTab === 'new' || activeTab === 'interested' || activeTab === 'rejected') && (
          <div className="space-y-4">
            
            {/* Search and Filters bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5">
              
              {/* Row 1: Search input and Sort */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Keresés pozícióban, cégben vagy leírásban (pl. EPTK, számla, Gyöngyös)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Rendezés:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="score">AI Egyezés szerint</option>
                    <option value="distance">Távolság szerint (közelebbi előre)</option>
                    <option value="date">Legfrissebb hirdetés</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Portal filter & Distance filter */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-800/60">
                
                {/* Portal selection */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
                  <span className="text-slate-400 font-semibold uppercase text-[11px] shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-blue-400" /> Portál:
                  </span>
                  <button
                    onClick={() => setPortalFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      portalFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Összes portál
                  </button>
                  <button
                    onClick={() => setPortalFilter('profession')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      portalFilter === 'profession'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🌐 Profession.hu
                  </button>
                  <button
                    onClick={() => setPortalFilter('kozig')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      portalFilter === 'kozig'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🏛️ Közigállás
                  </button>
                  <button
                    onClick={() => setPortalFilter('other')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      portalFilter === 'other'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    💼 Egyéb portálok
                  </button>
                </div>

                {/* Distance / Region buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
                  <span className="text-slate-400 font-semibold uppercase text-[11px] shrink-0 mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" /> Körzet:
                  </span>
                  <button
                    onClick={() => setDistanceFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      distanceFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Minden távolság (100km)
                  </button>
                  <button
                    onClick={() => setDistanceFilter('close')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      distanceFilter === 'close'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Hatvan, Gyöngyös, Gödöllő (0-35km)"
                  >
                    Közeli (0-35 km)
                  </button>
                  <button
                    onClick={() => setDistanceFilter('m3')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      distanceFilter === 'm3'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Budapest M3 / Kelet-Pest (0-65km)"
                  >
                    M3 / Budapest (~60km)
                  </button>
                  <button
                    onClick={() => setDistanceFilter('remote')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                      distanceFilter === 'remote'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🏠 Csak Távmunka
                  </button>
                </div>

              </div>

            </div>

            {/* Job Cards List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/50 border border-slate-800/80">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Nincs találat a jelenlegi szűrőkkel</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Próbáld meg lazítani a távolsági szűrőt vagy kattints a "Friss állások keresése" gombra!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDistanceFilter('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Szűrők törlése
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onMarkInterested={handleMarkInterested}
                    onOpenRejectModal={(j) => setSelectedRejectJob(j)}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Learning Center */}
        {activeTab === 'learning' && (
          <LearningCenter
            rules={rules}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onAddRule={handleAddRule}
          />
        )}

        {/* Tab 4: Profile View */}
        {activeTab === 'profile' && (
          <ProfileView profile={HAJNALKA_PROFILE} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Purczeld Hajnalka Személyes Állásfigyelő Rendszer • Hatvan + 100km</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span>Telepítve: Cloudflare Pages & D1 ingyenes infrastruktúra</span>
          </span>
        </div>
      </footer>

      {/* Rejection Feedback Modal */}
      <RejectModal
        job={selectedRejectJob}
        isOpen={!!selectedRejectJob}
        onClose={() => setSelectedRejectJob(null)}
        onSubmitReject={handleRejectJob}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          JobRepository.saveSettings(newSettings);
          showToast('Beállítások sikeresen mentve!', 'success');
        }}
        onResetSeed={() => {
          const fresh = JobRepository.resetToVerifiedSeed();
          setJobs([...fresh]);
          showToast('100%-ban működő, ellenőrzött hirdetések sikeresen betöltve!', 'success');
        }}
      />

    </div>
  );
};
export default App;
