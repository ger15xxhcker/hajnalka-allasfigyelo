import React from 'react';
import { Target, RefreshCw, Mail, Settings, Sparkles, MapPin } from 'lucide-react';
import { CandidateProfile } from '../types';

interface HeaderProps {
  profile: CandidateProfile;
  onRefreshScraper: () => void;
  isScraping: boolean;
  onOpenSettings: () => void;
  onTestEmail: () => void;
  isSendingEmail: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onRefreshScraper,
  isScraping,
  onOpenSettings,
  onTestEmail,
  isSendingEmail
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Candidate Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-2xl">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {profile.name} <span className="text-blue-400 font-semibold text-sm">| Állásfigyelő & Karrier AI</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Aktív keresés
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <strong>Hatvan + 100 km körzet</strong> (vagy Távmunka)
                </span>
                <span>•</span>
                <span>EPTK & Projektpénzügy referens</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Bérigény: Br. 700.000 Ft</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefreshScraper}
              disabled={isScraping}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 transition-all duration-150 disabled:opacity-50 cursor-pointer"
              title="Magyar állásportálok (Profession, Közigállás, stb.) friss átfésülése"
            >
              <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Keresés fut...' : 'Friss állások keresése'}</span>
            </button>

            <button
              onClick={onTestEmail}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Összefoglaló e-mail küldése Hajnalka címére (purczeld.hajnalka@gmail.com)"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">E-mail értesítő</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Rendszerbeállítások (Email, Resend API, Határkörzet, stb.)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
