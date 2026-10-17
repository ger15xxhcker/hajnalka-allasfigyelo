import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Info,
  Sliders
} from 'lucide-react';
import { LearnedRule, RuleType } from '../types';

interface LearningCenterProps {
  rules: LearnedRule[];
  onToggleRule: (ruleId: string, isActive: boolean) => void;
  onDeleteRule: (ruleId: string) => void;
  onAddRule: (rule: Omit<LearnedRule, 'id' | 'createdAt'>) => void;
}

export const LearningCenter: React.FC<LearningCenterProps> = ({
  rules,
  onToggleRule,
  onDeleteRule,
  onAddRule
}) => {
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [pattern, setPattern] = useState('');
  const [explanation, setExplanation] = useState('');
  const [ruleType, setRuleType] = useState<RuleType>('keyword_penalty');
  const [points, setPoints] = useState<number>(-25);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim() || !explanation.trim()) return;

    onAddRule({
      ruleType,
      pattern: pattern.trim(),
      adjustmentPoints: Number(points),
      explanation: explanation.trim(),
      isActive: true
    });

    setPattern('');
    setExplanation('');
    setIsAddingRule(false);
  };

  const getRuleIcon = (type: RuleType, points: number) => {
    if (points > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    return <TrendingDown className="w-4 h-4 text-rose-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Hero Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptív Karrier Algoritmus
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Hajnalka Személyes Tanulási Központja
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Minden alkalommal, amikor elutasítasz egy állást és leírod az okát, a program azonnal elemezi a visszajelzésedet. Itt láthatod a folyamatosan finomodó szabályokat, amik alapján a kereső egyre pontosabb találatokat ad neked!
            </p>
          </div>

          <button
            onClick={() => setIsAddingRule(!isAddingRule)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Új saját szabály hozzáadása</span>
          </button>
        </div>
      </div>

      {/* Manual Add Rule Form */}
      {isAddingRule && (
        <form onSubmit={handleAddSubmit} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Egyéni preferenciális szabály felvétele
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Keresési kifejezés / Minta:
              </label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="pl. heti 1 nap home office, SAP, Budapest 11. kerület"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Szabály típusa:
              </label>
              <select
                value={ruleType}
                onChange={(e) => {
                  const val = e.target.value as RuleType;
                  setRuleType(val);
                  if (val === 'keyword_boost') setPoints(20);
                  else setPoints(-30);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none"
              >
                <option value="keyword_penalty">Büntetés (Pontlevonás)</option>
                <option value="keyword_boost">Bónusz (Pont hozzáadás)</option>
                <option value="location_penalty">Helyszín büntetés</option>
                <option value="company_block">Cég elkerülése</option>
                <option value="salary_threshold">Bérsáv szigorítás</option>
                <option value="language_penalty">Nyelvtudás szigorítás</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pontszám módosítás (-100 és +50 között):
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Magyarázat (miért fontos neked ez a szabály?):
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="pl. Nem szeretnék Budapest déli részére járni, mert Hatvanból nagyon sok a menetidő."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Szabály mentése & Pontszámok frissítése
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Összesen {rules.length} db aktív tanulási szabály a profilban</span>
          <span>A ki/bekapcsolás azonnal újraszámolja a meglévő állásokat</span>
        </div>

        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              rule.isActive
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                : 'bg-slate-900/40 border-slate-800/40 opacity-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${
                  rule.adjustmentPoints > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'
                }`}>
                  {getRuleIcon(rule.ruleType, rule.adjustmentPoints)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      Minta: {rule.pattern}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      rule.adjustmentPoints > 0
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {rule.adjustmentPoints > 0 ? `+${rule.adjustmentPoints}` : rule.adjustmentPoints} pont
                    </span>
                    {rule.originFeedback && (
                      <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ⚡ Elutasításból generálva
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {rule.explanation}
                  </p>

                  {rule.originFeedback && (
                    <p className="text-xs text-slate-400 italic">
                      Hajnalka megjegyzése: "{rule.originFeedback}"
                    </p>
                  )}
                </div>
              </div>

              {/* Actions: Toggle & Delete */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400">{rule.isActive ? 'Aktív' : 'Kikapcsolva'}</span>
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) => onToggleRule(rule.id, e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>

                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Szabály törlése"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
