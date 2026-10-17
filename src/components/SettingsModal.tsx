import React, { useState } from 'react';
import { X, Save, Mail, Key, Cloud, Shield, Check, ExternalLink } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Rendszerbeállítások & Cloudflare</h3>
              <p className="text-xs text-slate-400">Értesítések, e-mail küldő és ütemezés</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Email recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Értesítési e-mail cím (Hajnalka):
            </label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 outline-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Erre a címre küldi a rendszer az összefoglaló e-mailt a releváns állások linkjével.
            </p>
          </div>

          {/* Resend API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Resend API Kulcs (Ingyenes 3000 email/hó):
              </label>
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Ingyenes regisztráció (resend.com) <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="re_xxxxxxxxxxxxxx (opcionális helyi teszthez)"
              value={formData.resendApiKey}
              onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 outline-none font-mono text-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              Kulcs nélkül az értesítő előnézeti/szimulált módban fut le, kulccsal közvetlenül postaládába küldi.
            </p>
          </div>

          {/* Min score for email notification */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Minimális egyezési küszöb e-mail küldéshez:
              </label>
              <span className="text-xs font-bold text-blue-400">{formData.minMatchScoreForEmail}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={formData.minMatchScoreForEmail}
              onChange={(e) => setFormData({ ...formData, minMatchScoreForEmail: Number(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Csak azokat az állásokat küldi el hírlevélben, amik legalább ennyire megfelelnek az elvárásainak.
            </p>
          </div>

          {/* Cloudflare Free Tier Note */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Cloud className="w-4 h-4" />
              <span>Cloudflare Ingyenes Tárhely & Ütemezés</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              A projekt teljes mértékben készen áll a Cloudflare Pages & D1 (ingyenes SQLite adatbázis) telepítésre. Egyetlen paranccsal élesíthető:
            </p>
            <code className="block p-2 rounded-lg bg-slate-950 text-cyan-400 font-mono text-xs">
              npx wrangler pages deploy ./dist --project-name=hajnalka-allasfigyelo
            </code>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Elmentve!' : 'Beállítások mentése'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
