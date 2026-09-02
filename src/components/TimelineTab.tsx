import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Coffee, 
  Hammer, 
  Armchair,
  Info,
  MapPin
} from 'lucide-react';
import { FullTachographData, DaySummary, ActivitySegment } from '../types/tachograph';
import { formatMinutes } from '../utils/legislationEngine';

interface TimelineTabProps {
  data: FullTachographData;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ data }) => {
  const days = data.days;
  const [selectedDayIndex, setSelectedDayIndex] = useState(days.length > 0 ? days.length - 1 : 0);
  const [hoveredSegment, setHoveredSegment] = useState<ActivitySegment | null>(null);

  const currentDay: DaySummary | undefined = days[selectedDayIndex];

  if (!currentDay) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Žádná denní data nejsou k dispozici.
      </div>
    );
  }

  // Calculate percentages for 24-hour timeline bar
  const totalDayMinutes = 1440; // 24 * 60

  const getActivityColor = (type: ActivitySegment['activity']) => {
    switch (type) {
      case 'DRIVING':
        return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'WORK':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'AVAILABILITY':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'REST':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      default:
        return 'bg-slate-400 hover:bg-slate-500 text-white';
    }
  };

  const getActivityLabelCz = (type: ActivitySegment['activity']) => {
    switch (type) {
      case 'DRIVING': return 'Řízení vozidla';
      case 'WORK': return 'Jiná práce (nakládka/údržba)';
      case 'AVAILABILITY': return 'Pohotovost';
      case 'REST': return 'Odpočinek / Přestávka';
      default: return 'Neznámá činnost';
    }
  };

  const getActivityIcon = (type: ActivitySegment['activity']) => {
    switch (type) {
      case 'DRIVING': return <Truck className="w-3.5 h-3.5" />;
      case 'WORK': return <Hammer className="w-3.5 h-3.5" />;
      case 'AVAILABILITY': return <Armchair className="w-3.5 h-3.5" />;
      case 'REST': return <Coffee className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Day Selector Ribbon / Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">
              Denní záznamy ({currentDay.dayNameCz}, {currentDay.dateStr})
            </h3>
            {currentDay.isComplianceClean ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bez přestupku
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {currentDay.infractions.length} {currentDay.infractions.length === 1 ? 'přestupek' : 'přestupky'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDayIndex(prev => Math.max(0, prev - 1))}
              disabled={selectedDayIndex === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 cursor-pointer transition-colors"
              title="Předchozí den"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Den {selectedDayIndex + 1} z {days.length}
            </span>
            <button
              onClick={() => setSelectedDayIndex(prev => Math.min(days.length - 1, prev + 1))}
              disabled={selectedDayIndex === days.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 cursor-pointer transition-colors"
              title="Následující den"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 28-Day Mini Calendar Strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {days.map((day, idx) => {
            const isSelected = idx === selectedDayIndex;
            const hasDrive = day.totalDrivingMinutes > 0;
            const hasInfraction = !day.isComplianceClean;
            const dateParts = day.dateStr.split('-');
            const shortDate = `${parseInt(dateParts[2], 10)}.${parseInt(dateParts[1], 10)}.`;

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 px-2.5 py-2 rounded-lg text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-2xs'
                    : hasInfraction
                    ? 'bg-rose-50/70 border-rose-200 text-rose-800 hover:bg-rose-100/60'
                    : hasDrive
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] font-bold uppercase opacity-75">
                  {day.dayNameCz.substring(0, 2)}
                </div>
                <div className="text-xs font-mono font-semibold my-0.5">
                  {shortDate}
                </div>
                <div className="flex justify-center mt-1">
                  {hasInfraction ? (
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                  ) : hasDrive ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 24h Visual Tachograph Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base text-slate-800">
              Tachografický pás činností (00:00 – 24:00)
            </h4>
            <p className="text-xs text-slate-500">
              Přesné časové rozložení směn dle čipové karty řidiče
            </p>
          </div>

          {/* Activity Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-rose-500" />
              <span className="text-slate-600 font-medium">Řízení ({formatMinutes(currentDay.totalDrivingMinutes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-amber-500" />
              <span className="text-slate-600 font-medium">Práce ({formatMinutes(currentDay.totalWorkMinutes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-blue-500" />
              <span className="text-slate-600 font-medium">Pohotovost ({formatMinutes(currentDay.totalAvailabilityMinutes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-600 font-medium">Odpočinek ({formatMinutes(currentDay.totalRestMinutes)})</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Interactive Timeline Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-12 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200 shadow-inner relative">
            {currentDay.activities.map((act) => {
              const widthPct = (act.durationMinutes / totalDayMinutes) * 100;
              return (
                <div
                  key={act.id}
                  style={{ width: `${widthPct}%` }}
                  onMouseEnter={() => setHoveredSegment(act)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`h-full transition-all cursor-pointer ${getActivityColor(act.activity)} border-r border-white/20`}
                  title={`${act.timeStr} - ${getActivityLabelCz(act.activity)} (${formatMinutes(act.durationMinutes)})`}
                />
              );
            })}
          </div>

          {/* Time axis ruler (0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h, 24h) */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1 font-medium">
            <span>00:00</span>
            <span>03:00</span>
            <span>06:00</span>
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
            <span>21:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Hover / Active Segment Inspector Card */}
        {hoveredSegment ? (
          <div className="bg-slate-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getActivityColor(hoveredSegment.activity)} text-white font-bold`}>
                {getActivityIcon(hoveredSegment.activity)}
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  {getActivityLabelCz(hoveredSegment.activity)}
                </span>
                <span className="text-slate-500 font-mono text-xs">
                  Začátek: {hoveredSegment.timeStr} • Trvání: {formatMinutes(hoveredSegment.durationMinutes)}
                </span>
              </div>
            </div>
            <div className="text-right text-slate-500 text-xs">
              <span>Vozidlo: <strong className="text-slate-700">{hoveredSegment.vehicleRegistration}</strong></span>
              <span className="block font-mono text-[11px]">Karta: {hoveredSegment.cardStatus === 'INSERTED' ? 'Vložena v slotu 1' : 'Vyjmuta'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Najeďte myší na libovolný barevný blok v pásu pro zobrazení přesného času a činnosti.</span>
          </div>
        )}

        {/* Day Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span className="text-slate-500 text-[11px] font-medium block">Denní doba řízení</span>
            <span className="text-lg font-bold text-slate-800 font-mono">
              {formatMinutes(currentDay.totalDrivingMinutes)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {currentDay.totalDrivingMinutes > 9 * 60 ? 'Využita 10h jízda' : 'Standard do 9h'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span className="text-slate-500 text-[11px] font-medium block">Jiná práce</span>
            <span className="text-lg font-bold text-slate-800 font-mono">
              {formatMinutes(currentDay.totalWorkMinutes)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Nakládky, vykládky, servis
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span className="text-slate-500 text-[11px] font-medium block">Denní odpočinek</span>
            <span className="text-lg font-bold text-slate-800 font-mono">
              {formatMinutes(currentDay.dailyRestMinutes)}
            </span>
            <span className={`text-[10px] font-semibold block mt-0.5 ${
              currentDay.dailyRestType === 'REGULAR_11H' ? 'text-emerald-600' :
              currentDay.dailyRestType === 'REDUCED_9H' ? 'text-blue-600' :
              currentDay.dailyRestType === 'INSUFFICIENT' ? 'text-rose-600' :
              'text-slate-400'
            }`}>
              {currentDay.dailyRestType === 'REGULAR_11H' ? 'Pravidelný (min. 11h)' :
               currentDay.dailyRestType === 'REDUCED_9H' ? 'Zkrácený (9-11h)' :
               currentDay.dailyRestType === 'WEEKLY_REST' ? 'Týdenní odpočinek' :
               currentDay.dailyRestType === 'INSUFFICIENT' ? 'Nedostatečný odpočinek!' : 'Mimo provoz'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span className="text-slate-500 text-[11px] font-medium block">Použitá vozidla & km</span>
            <span className="text-base font-bold text-slate-800 truncate block">
              {currentDay.vehicles.length > 0 ? currentDay.vehicles[0].registration : 'Bez vozidla'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              {currentDay.vehicles.reduce((acc, v) => acc + v.distanceKm, 0)} km
            </span>
          </div>
        </div>

      </div>

      {/* Row 2: Continuous Driving Segments Analysis & Day Infractions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Continuous Driving Segments (Article 7 561/2006) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-base text-slate-800">
                Úseky nepřetržitého řízení & Přestávky
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-mono">Čl. 7 (max 4h 30m)</span>
          </div>

          {currentDay.continuousDriveSegments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              V tento den neprobíhalo řízení vozidla.
            </p>
          ) : (
            <div className="space-y-3">
              {currentDay.continuousDriveSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    seg.isInfraction
                      ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          Úsek řízení: {seg.startTime} – {seg.endTime}
                        </span>
                        {seg.isInfraction ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                            Překročeno o {formatMinutes(seg.excessMinutes)}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            V limitu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Doba řízení: <strong className="text-slate-800">{formatMinutes(seg.driveMinutes)}</strong> (Limit: 4h 30m)
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 block text-[11px]">Následná přestávka:</span>
                      <span className={`font-bold ${seg.breakDetails.isValid ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {seg.qualifyingBreakMinutes > 0 ? formatMinutes(seg.qualifyingBreakMinutes) : 'Konec směny'}
                      </span>
                    </div>
                  </div>

                  {seg.breakDetails.firstBreakMin && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>Dělená přestávka:</span>
                      <span className="font-semibold text-slate-800">1. část ({formatMinutes(seg.breakDetails.firstBreakMin)})</span>
                      <span>+</span>
                      <span className="font-semibold text-slate-800">2. část ({formatMinutes(seg.breakDetails.secondBreakMin || 0)})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day Infractions or Places */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-base text-slate-800">
              Přestupky & GNSS Hranice pro tento den
            </h4>
          </div>

          {currentDay.infractions.length > 0 && (
            <div className="space-y-2">
              {currentDay.infractions.map(inf => (
                <div key={inf.id} className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      {inf.severityLabelCz}
                    </span>
                    <span className="text-xs font-mono text-rose-700 font-bold">{inf.fineEstimateCZK}</span>
                  </div>
                  <h5 className="font-bold text-xs text-rose-900">{inf.title}</h5>
                  <p className="text-[11px] text-rose-700 leading-relaxed">{inf.description}</p>
                </div>
              ))}
            </div>
          )}

          {currentDay.places.length > 0 ? (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-700 block">Záznamy státních hranic / míst:</span>
              {currentDay.places.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-bold text-blue-700 text-[11px]">
                      {p.country}
                    </span>
                    <span className="text-slate-700">{p.type === 'ENTRY' ? 'Zadání země / vjezd' : 'Výjezd'}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{p.odometer.toLocaleString('cs-CZ')} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Žádné hraniční přejezdy v tento den.</p>
          )}
        </div>

      </div>

      {/* Row 3: Raw Activity Events Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-base text-slate-800">
          Podrobný chronologický výpis přepnutí činností
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Čas</th>
                <th className="py-3 px-4">Činnost</th>
                <th className="py-3 px-4">Doba trvání</th>
                <th className="py-3 px-4">Vozidlo (SPZ)</th>
                <th className="py-3 px-4">Slot karty</th>
                <th className="py-3 px-4">Stav v tachografu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {currentDay.activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{act.timeStr}</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        act.activity === 'DRIVING' ? 'bg-rose-500' :
                        act.activity === 'WORK' ? 'bg-amber-500' :
                        act.activity === 'AVAILABILITY' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      <span className="font-semibold text-slate-800">{getActivityLabelCz(act.activity)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">{formatMinutes(act.durationMinutes)}</td>
                  <td className="py-3 px-4 text-slate-600">{act.vehicleRegistration}</td>
                  <td className="py-3 px-4 text-slate-500 font-sans">{act.slot === 'DRIVER_1' ? 'Slot 1 (Řidič)' : 'Slot 2 (Osádka)'}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      act.cardStatus === 'INSERTED' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`} title={act.cardStatus === 'INSERTED' ? 'Karta byla zasunuta v tachografu ve vozidle' : 'Mimo tachograf (manuální doplnění odpočinku)'}>
                      {act.cardStatus === 'INSERTED' ? 'Zasunuta v autě' : 'Vyjmuta (mimo auto)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
