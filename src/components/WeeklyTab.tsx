import React from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { FullTachographData, WeekSummary, BiWeeklySummary } from '../types/tachograph';
import { formatMinutes } from '../utils/legislationEngine';

interface WeeklyTabProps {
  data: FullTachographData;
}

export const WeeklyTab: React.FC<WeeklyTabProps> = ({ data }) => {
  const { weeks, biWeeks } = data;

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Týdenní a dvoutýdenní souhrny (Článek 6 & 8)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Automatická kontrola limitů 56 hodin v týdnu, 90 hodin za 2 týdny a týdenních odpočinků (45h / 24h).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Týdenní limit:</span>
            <span className="text-slate-800 font-bold text-sm">Max 56 h</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Dvoutýdenní limit:</span>
            <span className="text-indigo-600 font-bold text-sm">Max 90 h</span>
          </div>
        </div>
      </div>

      {/* Bi-Weekly 90-Hour Compliance Cards */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Dvoutýdenní cykly (Max 90 hodin za 2 po sobě jdoucí týdny)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {biWeeks.map((bw, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all ${
                bw.isExceeded
                  ? 'bg-rose-50/50 border-rose-200 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-800">{bw.periodLabel}</span>
                {bw.isExceeded ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Překročeno o {formatMinutes(bw.excessMinutes)}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> V limitu
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Celková doba řízení:</span>
                  <span className="font-bold font-mono text-slate-800 text-sm">
                    {formatMinutes(bw.totalDrivingMinutes)} / 90h
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bw.isExceeded ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, (bw.totalDrivingMinutes / bw.limitMinutes) * 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  {bw.isExceeded
                    ? 'Porušení Čl. 6 odst. 3 Nařízení 561/2006. Celková doba řízení za 2 po sobě následující týdny přesáhla 90 hodin.'
                    : `Zbývá rezerva ${formatMinutes(Math.max(0, bw.limitMinutes - bw.totalDrivingMinutes))} jízdy.`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Calendar Weeks List */}
      <div className="space-y-4 pt-2">
        <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Přehled jednotlivých kalendářních týdnů (Pondělí 00:00 – Neděle 24:00)</span>
        </h4>

        <div className="space-y-4">
          {weeks.map((week) => (
            <div
              key={week.weekNumber}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
            >
              {/* Week Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 font-mono">
                    W{week.weekNumber}
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-slate-800">
                      Kalendářní týden {week.weekNumber} ({week.year})
                    </h5>
                    <p className="text-xs text-slate-500">
                      Období: {week.startDateStr} až {week.endDateStr} • {week.daysCount} zaznamenaných dní
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {week.isClean ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Vše v pořádku
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {week.infractions.length} přestupků v týdnu
                    </span>
                  )}
                </div>
              </div>

              {/* Week KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <span className="text-[11px] font-medium text-slate-500 block">Týdenní doba řízení</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {formatMinutes(week.totalDrivingMinutes)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Limit: 56 h 00 min
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <span className="text-[11px] font-medium text-slate-500 block">10hodinové jízdy</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {week.extended10hDrivesCount} / 2
                  </span>
                  <span className={`text-[10px] font-semibold block mt-0.5 ${
                    week.extended10hDrivesCount > 2 ? 'text-rose-600' : 'text-slate-400'
                  }`}>
                    {week.extended10hDrivesCount > 2 ? 'Překročen limit!' : 'Povoleno max 2x'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <span className="text-[11px] font-medium text-slate-500 block">Zkrácené denní odpočinky</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {week.reducedDailyRestsCount} / 3
                  </span>
                  <span className={`text-[10px] font-semibold block mt-0.5 ${
                    week.reducedDailyRestsCount > 3 ? 'text-rose-600' : 'text-slate-400'
                  }`}>
                    {week.reducedDailyRestsCount > 3 ? 'Překročen limit!' : 'Povoleno max 3x'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <span className="text-[11px] font-medium text-slate-500 block">Týdenní odpočinek</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">
                    {formatMinutes(week.weeklyRestMinutes)}
                  </span>
                  <span className={`text-[10px] font-semibold block mt-0.5 ${
                    week.weeklyRestType === 'REGULAR_45H' ? 'text-emerald-600' :
                    week.weeklyRestType === 'REDUCED_24H' ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {week.weeklyRestType === 'REGULAR_45H' ? 'Pravidelný (min. 45h)' :
                     week.weeklyRestType === 'REDUCED_24H' ? 'Zkrácený (min. 24h + kompenzace)' : 'V průběhu'}
                  </span>
                </div>
              </div>

              {/* Days in this week list */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 block mb-2">Dny v tomto týdnu:</span>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {week.days.map(d => (
                    <div
                      key={d.dateStr}
                      className={`p-2.5 rounded-xl border text-center text-xs ${
                        !d.isComplianceClean
                          ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                          : d.totalDrivingMinutes > 0
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{d.dayNameCz.substring(0, 2)}</div>
                      <div className="font-mono text-[11px] opacity-75 my-0.5">
                        {d.dateStr.split('-').slice(1).reverse().join('.')}
                      </div>
                      <div className="font-mono font-bold text-[11px] text-indigo-600">
                        {d.totalDrivingMinutes > 0 ? formatMinutes(d.totalDrivingMinutes) : 'Volno'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
