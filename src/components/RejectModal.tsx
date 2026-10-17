import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Check, BrainCircuit } from 'lucide-react';
import { Job } from '../types';

interface RejectModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReject: (jobId: string, reasonText: string, category: string) => void;
}

const PRESET_CATEGORIES = [
  {
    id: 'distance',
    label: '🚗 Túl messze van / Nincs elég Home Office',
    defaultText: 'Túl nagy az utazási távolság Hatvanból, vagy nincs elegendő Home Office lehetőség.'
  },
  {
    id: 'salary',
    label: '💰 Alacsony fizetés (< 700.000 Ft bruttó)',
    defaultText: 'A felkínált bérsáv nem éri el a megcélzott bruttó 700.000 Ft-os szintet.'
  },
  {
    id: 'language',
    label: '🗣️ Túl magas angol elvárás (C1 / Tárgyalási szint)',
    defaultText: 'Túl szigorú, tárgyalási szintű angol nyelvtudást várnak el, nekem alapszintű az angolom.'
  },
  {
    id: 'mismatch',
    label: '📄 Nem vág a profilomba (nem projektpénzügy/EPTK)',
    defaultText: 'A munkakör feladatai nem felelnek meg a projektpénzügyi referens / EPTK irányvonalnak.'
  },
  {
    id: 'company',
    label: '🏢 Nem szimpatikus cég / Munkakörülmények',
    defaultText: 'A céggel vagy a munkakörülményekkel kapcsolatos fenntartások miatt nem megfelelő.'
  }
];

export const RejectModal: React.FC<RejectModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmitReject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('distance');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSelectCategory = (catId: string, defaultText: string) => {
    setSelectedCategory(catId);
    if (!customReason) {
      setCustomReason(defaultText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() || 
      PRESET_CATEGORIES.find(c => c.id === selectedCategory)?.defaultText || 
      'Nem megfelelő ajánlat';

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReject(job.id, finalReason, selectedCategory);
      setIsSubmitting(false);
      setCustomReason('');
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Állás elutasítása & Tanulás</h3>
              <p className="text-xs text-slate-400">Visszajelzéseddel javítod a kereső algoritmust</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job mini summary */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Kiválasztott állás:</p>
          <h4 className="text-sm font-bold text-white mt-0.5">{job.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {job.company} • {job.location} ({job.distanceKm} km Hatvantól)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Quick preset chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Válassz okot vagy gyors kategóriát:
            </label>
            <div className="space-y-1.5">
              {PRESET_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id, cat.defaultText)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span>{cat.label}</span>
                  {selectedCategory === cat.id && <Check className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed free text box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Miért nem jó? (Írd le a saját szavaiddal, hogy tanuljon a rendszer):
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="pl. Napi 2 óra utazás lenne a 11. kerületbe, nincs home office. Inkább heti 2-3 nap távmunkát vagy közelebbi helyet keresek."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-slate-200 text-sm placeholder:text-slate-500 resize-none outline-none transition"
            />
          </div>

          {/* Live explanation of how the system learns */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <strong>Hogyan tanul ebből a program?</strong> A megadott indoklás alapján egy új szabály generálódik a profilodhoz (pl. helyszíni bejárási vagy kulcsszó büntetés), ami azonnal újraszámolja az összes többi és a jövőbeli állás pontszámát!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{isSubmitting ? 'Tanulás folyamatban...' : 'Elutasítás mentése & Tanulás'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
