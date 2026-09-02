import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Coffee, 
  Users, 
  Ship, 
  FileText, 
  AlertTriangle, 
  Check, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LegislationGuideTab: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('breaks');

  const toggle = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      
      {/* Guide Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Průvodce a tahák legislativy EU 561/2006 & Balíček mobility I
            </h3>
            <p className="text-xs text-slate-500">
              Kompletní přehled pravidel pro řidiče kamionů a autobusů na jednom místě.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion / Cards List */}
      <div className="space-y-4">
        
        {/* SECTION 1: Continuous driving & breaks */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('breaks')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  Nepřetržitá doba řízení & Bezpečnostní přestávky (Článek 7)
                </h4>
                <p className="text-xs text-slate-500">Maximálně 4,5 hodiny řízení před přestávkou</p>
              </div>
            </div>
            {expandedSection === 'breaks' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 'breaks' && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">A. Jednorázová přestávka</span>
                  <p className="leading-relaxed">
                    Po nejvýše <strong>4 hodinách a 30 minutách</strong> řízení musí řidič udělat nepřerušovanou přestávku v délce nejméně <strong>45 minut</strong>.
                  </p>
                  <div className="font-mono text-emerald-700 text-[11px] p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    Jízda 4:30 ➔ Přestávka 0:45 ➔ Jízda může pokračovat
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">B. Dělená přestávka (15 + 30 min)</span>
                  <p className="leading-relaxed">
                    Přestávku 45 minut lze rozdělit pouze do 2 částí: první část nejméně <strong>15 minut</strong> a druhá část nejméně <strong>30 minut</strong> v tomto přesném pořadí!
                  </p>
                  <div className="font-mono text-indigo-700 text-[11px] p-2.5 bg-indigo-50 rounded-lg border border-indigo-200">
                    Jízda 2:00 ➔ Pauza 0:15 ➔ Jízda 2:30 ➔ Pauza 0:30 (RESET!)
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                <strong>Pozor na častou chybu:</strong> Pořadí 30 min + 15 min <u>NEPLATÍ</u>! Pokud uděláte nejprve 30 minut a pak 15 minut, počítá se to pouze jako 15minutová část a hrozí pokuta za překročení 4,5h jízdy.
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Daily driving time */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('daily_drive')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  Denní doba řízení (Článek 6 odst. 1)
                </h4>
                <p className="text-xs text-slate-500">Standardně 9 hodin, možnost 2x týdně na 10 hodin</p>
              </div>
            </div>
            {expandedSection === 'daily_drive' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 'daily_drive' && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">Běžná denní jízda (9 hodin)</span>
                  <p className="leading-relaxed">
                    Běžná denní doba řízení nesmí přesáhnout <strong>9 hodin</strong> mezi dvěma denními odpočinky (nebo denním a týdenním odpočinkem).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">Prodloužená jízda na 10 hodin (Max 2x týdně)</span>
                  <p className="leading-relaxed">
                    Denní dobu řízení smí řidič prodloužit nejvýše na <strong>10 hodin</strong>, a to maximálně <strong>dvakrát za kalendářní týden</strong> (pondělí 00:00 – neděle 24:00).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Daily Rest Period */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('daily_rest')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  Denní doba odpočinku (Článek 8 odst. 2 & 4)
                </h4>
                <p className="text-xs text-slate-500">Pravidelný 11h, dělený 3+9h, zkrácený 9h (max 3x v týdnu)</p>
              </div>
            </div>
            {expandedSection === 'daily_rest' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 'daily_rest' && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-emerald-700 text-sm block">Pravidelný odpočinek (11h)</span>
                  <p className="leading-relaxed">
                    V rámci každých 24 hodin od začátku směny musí mít řidič nepřerušený odpočinek nejméně <strong>11 hodin</strong>. Směna smí trvat max. 13 hodin.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-700 text-sm block">Dělený odpočinek (3h + 9h)</span>
                  <p className="leading-relaxed">
                    Lze rozdělit na dvě části: první část min. <strong>3 hodiny</strong> a druhá část min. <strong>9 hodin</strong> (celkem 12h odpočinku). Směna může trvat až 15 hodin.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-blue-700 text-sm block">Zkrácený odpočinek (9h)</span>
                  <p className="leading-relaxed">
                    Odpočinek lze zkrátit na min. <strong>9 hodin</strong> nejvýše <strong>3x mezi dvěma týdenními odpočinky</strong>. Směna smí trvat až 15 hodin.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Weekly and Bi-weekly Limits */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('weekly')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  Týdenní a dvoutýdenní limity & Týdenní odpočinek (Čl. 6 & 8)
                </h4>
                <p className="text-xs text-slate-500">Max 56h za týden, 90h za 2 týdny, 45h / 24h týdenní odpočinek</p>
              </div>
            </div>
            {expandedSection === 'weekly' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 'weekly' && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-sm block">Týdenní a dvoutýdenní jízda</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>V jednom kalendářním týdnu (Po 00:00 – Ne 24:00): <strong>max. 56 hodin</strong>.</li>
                    <li>V jakýchkoliv 2 po sobě následujících týdnech: <strong>max. 90 hodin</strong>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-sm block">Týdenní odpočinek</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li><strong>Pravidelný:</strong> min. 45 hodin (zákaz trávit v kabině vozidla dle Balíčku mobility!).</li>
                    <li><strong>Zkrácený:</strong> min. 24 hodin (zkrácení musí být nahrazeno v celku do konce 3. týdne).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Special Rules (Article 12, Ferry, Double Crew) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('special')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  Speciální pravidla: Článek 12, Trajekt a Osádka ve dvou
                </h4>
                <p className="text-xs text-slate-500">Výjimečné situace, přejezd lodi a práce v osádce</p>
              </div>
            </div>
            {expandedSection === 'special' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 'special' && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-700 text-sm block">Článek 12 (Výjimečná situace)</span>
                  <p className="leading-relaxed">
                    Pokud nelze bezpečně zaparkovat, řidič se může odchýlit od limitů jízdy o max. 1-2h k dosažení parkoviště nebo základny.
                  </p>
                  <p className="text-indigo-900 font-semibold bg-indigo-50 p-2 rounded border border-indigo-100">
                    Ihned po zastavení musíte udělat výtisk z tachografu a na zadní stranu ručně napsat důvod a podepsat se!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-blue-700 text-sm block">Pravidlo trajektu / vlaku (Čl. 9)</span>
                  <p className="leading-relaxed">
                    Běžný denní odpočinek (11h) lze přerušit nejvýše <strong>2x na celkem max. 1 hodinu</strong> (pro nájezd a sjezd z lodi).
                  </p>
                  <p className="text-slate-500">
                    Řidič musí mít na lodi k dispozici lůžko nebo lehátko.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-sm block">Vícenásobná osádka (2 řidiči)</span>
                  <p className="leading-relaxed">
                    Časový cyklus směny se prodlužuje na <strong>30 hodin</strong>.
                  </p>
                  <p className="text-slate-500">
                    V rámci 30 hodin musí mít každý řidič odpočinek nejméně <strong>9 hodin</strong>. Druhý řidič musí nastoupit nejpozději do 1 hodiny od výjezdu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: Country Symbols, Border Crossings & Shift Continuity */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle('countries')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800">
                  Symboly zemí, přejezdy hranic & návaznost směn (Čl. 34 Nařízení 165/2014)
                </h4>
                <p className="text-xs text-slate-500">Výchozí země, cílová země, hraniční přechody a kontinuita států</p>
              </div>
            </div>
            {expandedSection === 'countries' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSection === 'countries' && (
            <div className="p-6 pt-0 border-t border-slate-100 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-emerald-700 text-sm block">1. Výchozí země (Začátek směny)</span>
                  <p className="leading-relaxed">
                    Při zahájení denní pracovní doby / vložení karty je řidič <strong>povinen zadat symbol státu</strong> (např. CZ, D, PL), ve kterém začíná pracovat.
                  </p>
                  <p className="text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 text-[11px] font-semibold">
                    Čl. 34 odst. 7: Začátek směny bez zadání výchozí země je závažný přestupek.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-blue-700 text-sm block">2. Přejezd hranic (Balíček mobility)</span>
                  <p className="leading-relaxed">
                    Od 2. února 2022 musí řidič po přejetí státní hranice zastavit na <strong>nejbližším vhodném místě na hranici nebo za ní</strong> a zadat do tachografu symbol země, do které vstoupil (u Smart Tacho Gen 2 se zapisuje automaticky přes GNSS).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-indigo-700 text-sm block">3. Návaznost zemí po odpočinku</span>
                  <p className="leading-relaxed">
                    Pokud ukončíte směnu v Německu (<strong>Cílová země: D</strong>) a strávíte tam denní odpočinek, musíte následující den zahájit směnu v téže zemi (<strong>Výchozí země: D</strong>).
                  </p>
                  <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-[11px]">
                    Pokud druhý den zapomenete zadat výchozí zemi D nebo zadáte CZ, vzniká rozpor a přestupek neoprávněného zadání či absence výchozí země!
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 space-y-1">
                <strong>Praktický příklad pro kontrolu:</strong>
                <p className="text-[11px] text-slate-600">
                  Den 1: Výjezd z ČR do Německa ➔ Start: <code>CZ</code> ➔ Přejezd hranice: <code>D</code> ➔ Konec směny / Odpočinek v DE: <code>D</code>.<br />
                  Den 2: Probuzení v Německu a zahájení další směny ➔ <strong>Výchozí země MUSÍ být <code>D</code>!</strong> Teprve po návratu do ČR zadáte přejezd hranice a cíl <code>CZ</code>.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
