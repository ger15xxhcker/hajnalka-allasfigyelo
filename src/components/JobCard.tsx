import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onMarkInterested: (jobId: string) => void;
  onOpenRejectModal: (job: Job) => void;
  onUpdateStatus?: (jobId: string, status: 'new' | 'interested' | 'rejected' | 'applied') => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onMarkInterested,
  onOpenRejectModal,
  onUpdateStatus
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Score styling
  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        label: `⭐ ${score}% Kiváló illeszkedés`,
        barColor: 'bg-emerald-500'
      };
    }
    if (score >= 75) {
      return {
        bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
        label: `🎯 ${score}% Nagyon jó egyezés`,
        barColor: 'bg-blue-500'
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        label: `🔍 ${score}% Részleges egyezés`,
        barColor: 'bg-amber-500'
      };
    }
    return {
      bg: 'bg-slate-700/30 border-slate-700 text-slate-400',
      label: `${score}% Alacsony egyezés`,
      barColor: 'bg-slate-600'
    };
  };

  const badge = getScoreBadge(job.matchScore);

  const getPortalBadge = (source: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('profession')) {
      return {
        bg: 'bg-red-500/15 text-red-300 border-red-500/30',
        label: 'Profession.hu',
        icon: '🌐'
      };
    }
    if (s.includes('kozig') || s.includes('közigállás') || s.includes('közszféra')) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        label: 'Közigállás (Közszféra)',
        icon: '🏛️'
      };
    }
    if (s.includes('dreamjob') || s.includes('dreamjo.bs')) {
      return {
        bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        label: 'Dreamjo.bs',
        icon: '✨'
      };
    }
    if (s.includes('jobinfo')) {
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        label: 'Jobinfo.hu',
        icon: '💼'
      };
    }
    if (s.includes('mate') || s.includes('egyetem')) {
      return {
        bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        label: 'Egyetemi karrierportál',
        icon: '🎓'
      };
    }
    return {
      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      label: source || 'Állásportál',
      icon: '🌐'
    };
  };

  const portal = getPortalBadge(job.source);

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      job.status === 'rejected'
        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
        : job.status === 'interested'
        ? 'bg-slate-900/90 border-blue-500/40 shadow-lg shadow-blue-500/5'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md hover:shadow-xl'
    }`}>
      {/* Top Banner with Score & Prominent Portal Badge */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}>
            {badge.label}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${portal.bg}`}>
            <span>{portal.icon}</span>
            <span>Portál: <strong>{portal.label}</strong></span>
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {job.postedAt}
          </span>
        </div>

        {/* Current status pill */}
        {job.status === 'interested' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Elvileg jó lehet (Mentve)
          </span>
        )}
        {job.status === 'applied' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <Send className="w-3.5 h-3.5" /> Pályázat elküldve
          </span>
        )}
        {job.status === 'rejected' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Elutasítva
          </span>
        )}
      </div>

      {/* Main Card Content */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2 flex-1">
            
            {/* Title & Company */}
            <h2 className="text-lg sm:text-xl font-bold text-white hover:text-blue-400 transition">
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 group">
                {job.title}
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </a>
            </h2>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                <Building2 className="w-4 h-4 text-blue-400" />
                {job.company}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${portal.bg}`}>
                <span>{portal.icon}</span>
                <span>{portal.label}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {job.workModel === 'remote' ? '🏠 100% Home Office' : job.workModel === 'hybrid' ? '🔄 Hibrid' : '🏢 Bejárós'} 
                {job.distanceKm !== undefined && ` • ${job.distanceKm} km Hatvantól`}
              </span>
            </div>

            {/* Salary if available */}
            {job.salaryRaw && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{job.salaryRaw}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: "Elvileg jó lehet" & "Elutasítás" */}
          <div className="flex sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
            {job.status !== 'interested' && job.status !== 'applied' && (
              <button
                onClick={() => onMarkInterested(job.id)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                title="Mentés az ígéretes állások közé"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Elvileg jó lehet</span>
              </button>
            )}

            {job.status !== 'rejected' && (
              <button
                onClick={() => onOpenRejectModal(job)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 text-slate-300 border border-slate-700 transition cursor-pointer"
                title="Elutasítás és visszajelzés küldése az algoritmus finomhangolásához"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Elutasítás</span>
              </button>
            )}

            {job.status === 'interested' && onUpdateStatus && (
              <button
                onClick={() => onUpdateStatus(job.id, 'applied')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Pályáztam rá!</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Relevance Explanation Box */}
        {job.matchReasons && job.matchReasons.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/50">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Miért illik Hajnalkához?</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {job.matchReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* If Rejected: Show why it was rejected */}
        {job.status === 'rejected' && job.rejectionReason && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Hajnalka elutasítási indoklása:</span>
            </div>
            <p className="text-slate-300 italic">"{job.rejectionReason}"</p>
          </div>
        )}

        {/* Badges */}
        {job.matchBadges && job.matchBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.matchBadges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Description */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>Részletek összecsukása <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Munkaköri leírás & elvárások megtekintése <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <p className="leading-relaxed whitespace-pre-line">{job.description}</p>
              
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-1.5">Főbb elvárások:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-xs">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
                >
                  Eredeti hirdetés megnyitása a(z) {job.source} oldalon ➜
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} állás`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
                  title="Ha a portál hirdetése időközben lejárna, ezzel a kereséssel közvetlenül megtalálható a cég karrieroldalán"
                >
                  🔍 Google keresés erre az állásra ↗
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
