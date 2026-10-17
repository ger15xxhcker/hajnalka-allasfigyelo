import React from 'react';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  Languages, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { CandidateProfile } from '../types';

interface ProfileViewProps {
  profile: CandidateProfile;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-blue-500/20">
            PH
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h2>
            <p className="text-blue-400 font-semibold text-sm">
              Projektpénzügyi referens • EPTK & Forráselszámolási szakértő
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {profile.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {profile.baseLocation} (Hatvan) + {profile.maxDistanceKm} km körzet
              </span>
            </div>
          </div>
        </div>

        {/* Core Constraints Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Bérigény</span>
            <span className="text-sm font-bold text-emerald-400">Bruttó 700.000 Ft</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Szakmai tapasztalat</span>
            <span className="text-sm font-bold text-white">4+ év (EU projektek & EPTK)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 block font-medium">Angol nyelvtudás</span>
            <span className="text-sm font-bold text-amber-400">Alapszint (nem tárgyalási)</span>
          </div>
        </div>
      </div>

      {/* Experience history from CV */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          Szakmai Tapasztalat (Önéletrajz alapján)
        </h3>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          
          {/* Máltai */}
          <div className="relative pl-8 space-y-1">
            <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-slate-900"></div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-base font-bold text-white">Projekt pénzügyi referens</h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                2022 – 2026. június
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300">Magyar Máltai Szeretetszolgálat • Budapest</p>
            <ul className="text-xs text-slate-400 space-y-1 pt-1 list-disc pl-4">
              <li>Szállítói számlák teljes körű kezelése: beérkezéstől az archiválásig, ellenőrzés, nyilvántartás, fizetési határidők.</li>
              <li>EPTK-felület haladó szintű kezelése: kifizetési kérelmek rögzítése, hiánypótlások, szállítói szerződésmodul.</li>
              <li>Projektköltségek monitorozása és ellenőrzése a kereteknek megfelelően.</li>
              <li>Banki tranzakciók követése, kivonatok ellenőrzése, beszerzési folyamatok dokumentálása.</li>
            </ul>
          </div>

          {/* IFKA */}
          <div className="relative pl-8 space-y-1">
            <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-900"></div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-base font-bold text-white">Junior forráselszámolási asszisztens</h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                2020 – 2022
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-300">IFKA Közhasznú Nonprofit Kft. • Budapest</p>
            <ul className="text-xs text-slate-400 space-y-1 pt-1 list-disc pl-4">
              <li>Könyvelői munkák támogatása: bankok könyvelése, számlák kontírozása, utalások előkészítése.</li>
              <li>Pénzügyi elszámolások és kifizetési dokumentációk összeállítása.</li>
              <li>EPTK-felület kezelése: kifizetési kérelmek rögzítése, hiánypótlások intézése.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Studies */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          Tanulmányok & Végzettségek
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-bold text-blue-400 uppercase">Felsőfokú Alapképzés (BSc)</span>
            <h4 className="text-sm font-bold text-white mt-1">Pénzügy és számvitel BSc</h4>
            <p className="text-xs text-slate-300 mt-0.5">Magyar Agrár- és Élettudományi Egyetem (MATE) • Gyöngyös</p>
            <span className="inline-block mt-2 text-xs font-medium text-slate-400">Várható végzés: 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase">OKJ Szakképesítés</span>
            <h4 className="text-sm font-bold text-white mt-1">Pénzügyi-számviteli ügyintéző</h4>
            <p className="text-xs text-slate-300 mt-0.5">Gróf Batthyány Lajos Technikum • Hatvan</p>
            <span className="inline-block mt-2 text-xs font-medium text-slate-400">Sikeres vizsga: 2017</span>
          </div>
        </div>
      </div>

      {/* Core skills */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Kulcskompetenciák a Kereső Algoritmusban
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {profile.coreStrengths.map((str, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{str}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
