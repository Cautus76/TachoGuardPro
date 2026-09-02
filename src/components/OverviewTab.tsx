import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Info,
  Zap,
  Gauge,
  Calendar,
  AlertCircle,
  FileCheck,
  Award,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { FullTachographData, DriverCardInfo } from '../types/tachograph';
import { formatMinutes } from '../utils/legislationEngine';

interface OverviewTabProps {
  data: FullTachographData;
  cardInserted?: boolean;
  onToggleCard?: () => void;
  onInsertCard?: () => void;
  onEjectCard?: () => void;
  onNavigateToTab: (tab: 'overview' | 'timeline' | 'weekly' | 'infractions' | 'protocol' | 'guide') => void;
  onOpenReaderModal: () => void;
  onUpdateDriver?: (newDriver: DriverCardInfo) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  cardInserted = false,
  onToggleCard,
  onInsertCard,
  onEjectCard,
  onNavigateToTab,
  onOpenReaderModal,
  onUpdateDriver
}) => {
  const { driver, overallStats, allInfractions, weeks } = data;
  const currentWeek = weeks[weeks.length - 1];

  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [editedSurname, setEditedSurname] = useState(driver.driverSurname);
  const [editedFirstNames, setEditedFirstNames] = useState(driver.driverFirstNames);
  const [editedCardNumber, setEditedCardNumber] = useState(driver.cardNumber);

  const handleSaveDriver = () => {
    if (onUpdateDriver) {
      onUpdateDriver({
        ...driver,
        driverSurname: editedSurname.trim().toUpperCase(),
        driverFirstNames: editedFirstNames.trim(),
        cardNumber: editedCardNumber.trim().toUpperCase()
      });
    }
    setIsEditingDriver(false);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return {
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      label: 'Výborný stav',
      textColor: 'text-emerald-600'
    };
    if (score >= 70) return {
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      label: 'Drobné odchylky',
      textColor: 'text-amber-600'
    };
    return {
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      label: 'Vysoké riziko',
      textColor: 'text-rose-600'
    };
  };

  const getRiskBadge = (risk: typeof overallStats.riskLevel) => {
    switch (risk) {
      case 'LOW':
        return {
          label: 'V POŘÁDKU / BEZ ZÁVAŽNÝCH POKUT',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: ShieldCheck
        };
      case 'MEDIUM':
        return {
          label: 'STŘEDNÍ RIZIKO (Drobné přestupky)',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle
        };
      case 'HIGH':
        return {
          label: 'VYSOKÉ RIZIKO POKUTY (Závažné)',
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: AlertTriangle
        };
      case 'CRITICAL':
        return {
          label: 'KRITICKÉ RIZIKO (Hrozí odstavení)',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle
        };
    }
  };

  const riskInfo = getRiskBadge(overallStats.riskLevel);
  const scoreInfo = getScoreBadge(overallStats.complianceScore);
  const RiskIcon = riskInfo.icon;

  return (
    <div className="space-y-6">
      
      {/* 4 Metric Stats Summary Cards (Professional Polish Theme Archetype) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Driving Time 28d */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Celková doba řízení (28d)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {overallStats.totalDrivingHours} h
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Průměrně {(overallStats.totalDrivingHours / Math.max(1, overallStats.totalDaysAnalyzed)).toFixed(1)} h / směna</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Detected Infractions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Zjištěné přestupky
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              allInfractions.length === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              allInfractions.length === 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {allInfractions.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {allInfractions.length === 0 ? 'Plná shoda s 561/2006' : `${overallStats.infractionsBySeverity.minor} lehkých, ${overallStats.infractionsBySeverity.serious + overallStats.infractionsBySeverity.verySerious} závažných`}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Km */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ujeto kilometrů
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {overallStats.totalKmDriven.toLocaleString('cs-CZ')} km
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zkontrolováno {overallStats.totalDaysAnalyzed} kalendářních dnů
            </p>
          </div>
        </div>

        {/* Metric 4: Compliance Index */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Index shody legislativy
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${scoreInfo.textColor}`}>
              {overallStats.complianceScore}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {scoreInfo.label} (EU 561/2006)
            </p>
          </div>
        </div>

      </div>

      {/* Row 2: Driver Smart Card Box + Compliance Index Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Driver Card Representation (European Tachograph Smart Card Design) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              {/* EU Flag Badge & Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-blue-700 rounded flex items-center justify-center font-bold text-xs text-amber-300 shadow-sm shrink-0">
                  CZ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      KARTA ŘIDIČE • DRIVER CARD
                    </h3>
                    {cardInserted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> VLOŽENA VE ČTEČCE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> VYSUNUTA ZE ČTEČKY
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    ČESKÁ REPUBLIKA / EU TACHOGRAPH
                  </p>
                </div>
              </div>

              {/* Smart Card Chip Graphic & Slot Toggle & Edit */}
              <div className="flex items-center gap-2 shrink-0">
                {onToggleCard && (
                  <button
                    onClick={onToggleCard}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                      cardInserted
                        ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    }`}
                    title={cardInserted ? 'Vysunout kartu ze čtečky' : 'Zasunout kartu do čtečky'}
                  >
                    <span>{cardInserted ? 'Vyjmout' : 'Zasunout'}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditingDriver(!isEditingDriver)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Upravit jméno a číslo karty"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className={`w-11 h-9 rounded-md border shadow-xs flex flex-col justify-around p-1 transition-all ${
                  cardInserted 
                    ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-amber-600/40 ring-2 ring-emerald-400/40' 
                    : 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-slate-400/60 opacity-80'
                }`}>
                  <div className="h-0.5 w-full bg-amber-700/40 rounded-full" />
                  <div className="h-0.5 w-3/4 bg-amber-700/40 rounded-full" />
                  <div className="h-0.5 w-full bg-amber-700/40 rounded-full" />
                </div>
              </div>
            </div>

            {/* Driver Details Grid or Edit Form */}
            {isEditingDriver ? (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Příjmení řidiče:
                    </label>
                    <input
                      type="text"
                      value={editedSurname}
                      onChange={(e) => setEditedSurname(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Jméno řidiče:
                    </label>
                    <input
                      type="text"
                      value={editedFirstNames}
                      onChange={(e) => setEditedFirstNames(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Číslo karty:
                    </label>
                    <input
                      type="text"
                      value={editedCardNumber}
                      onChange={(e) => setEditedCardNumber(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditingDriver(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Zrušit</span>
                  </button>
                  <button
                    onClick={handleSaveDriver}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Uložit změny</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">1. Příjmení / Surname</span>
                  <span className="font-bold text-slate-800 text-sm">{driver.driverSurname}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">2. Jméno / First Name</span>
                  <span className="font-bold text-slate-800 text-sm">{driver.driverFirstNames}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">3. Datum narození</span>
                  <span className="font-semibold text-slate-700">{driver.birthDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">4a. Platnost od</span>
                  <span className="font-semibold text-slate-700">{driver.cardIssueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">4b. Platnost do</span>
                  <span className="font-bold text-amber-600">{driver.cardExpiryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">4c. Vydal úřad</span>
                  <span className="font-medium text-slate-700 truncate block">{driver.issuingAuthority}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[11px] block font-medium">5b. Číslo karty řidiče</span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider text-sm">{driver.cardNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Generace tachografu</span>
                  <span className="font-semibold text-slate-700">{driver.generation}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px] font-mono">Zdroj dat: {driver.fileName || 'USB Čtečka'}</span>
            <button
              onClick={onOpenReaderModal}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Změnit / načíst jinou kartu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compliance Score & Risk Indicator */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">Právní status a posouzení</h3>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5 ${riskInfo.bg}`}>
                <RiskIcon className="w-3.5 h-3.5" />
                {riskInfo.label}
              </span>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-5 my-5">
              <div className={`w-22 h-22 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-2xs ${scoreInfo.color}`}>
                <span className="text-3xl font-extrabold tracking-tight">
                  {overallStats.complianceScore}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Audit
                </span>
              </div>

              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Auditováno dní:</span>
                  <span className="font-bold text-slate-800">{overallStats.totalDaysAnalyzed} směn (28 dní)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Počet přestupků:</span>
                  <span className={`font-bold ${overallStats.totalInfractionsCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {overallStats.totalInfractionsCount} celkem
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Odhad sankce (CZ/EU):</span>
                  <span className="font-bold text-slate-800">
                    {overallStats.totalInfractionsCount === 0 ? '0 Kč (Bez pokuty)' : 'cca 2 000 – 8 000 Kč'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Infraction severity breakdown pill counters */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Lehké</span>
              <span className="text-sm font-bold text-amber-600">{overallStats.infractionsBySeverity.minor}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Závažné</span>
              <span className="text-sm font-bold text-orange-600">{overallStats.infractionsBySeverity.serious}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">V. Závažné</span>
              <span className="text-sm font-bold text-rose-600">{overallStats.infractionsBySeverity.verySerious}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Kritické</span>
              <span className="text-sm font-bold text-red-700">{overallStats.infractionsBySeverity.mostSerious}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Remaining Driving Time Calculator / Shift Advisor */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Kalkulačka a limity pro aktuální směnu & týden</h3>
              <p className="text-xs text-slate-500">Pravidla podle Nařízení EP a Rady (ES) č. 561/2006</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('guide')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Pravidla 561/2006</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Card 1: Continuous Drive */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Do 45m přestávky:</span>
              <span className="font-mono font-bold text-indigo-600">Max 4h 30m</span>
            </div>
            <div className="text-xl font-bold text-slate-800">
              {formatMinutes(overallStats.currentShiftRemaining.continuousDriveRemainingMinutes)}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (overallStats.currentShiftRemaining.continuousDriveRemainingMinutes / 270) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Po 4,5h jízdy musíte udělat min. 45 min přestávku (nebo dělenou 15 + 30 min).
            </p>
          </div>

          {/* Card 2: Daily Drive */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Denní doba řízení:</span>
              <span className="font-mono font-bold text-indigo-600">
                {overallStats.currentShiftRemaining.canExtendTo10h ? 'Max 10h' : 'Max 9h'}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-800">
              {formatMinutes(overallStats.currentShiftRemaining.dailyDriveRemainingMinutes)}
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (overallStats.currentShiftRemaining.dailyDriveRemainingMinutes / 600) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Standardně 9h, možnost prodloužení na 10h max 2x v kalendářním týdnu.
            </p>
          </div>

          {/* Card 3: 10h Extensions & Reduced Rests */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Prodloužené jízdy (10h):</span>
              <span className="font-bold text-slate-700">
                {overallStats.currentShiftRemaining.extendedDrivesUsedThisWeek} z 2 v týdnu
              </span>
            </div>
            <div className="flex gap-1.5 py-1">
              <div className={`flex-1 h-2.5 rounded-full border ${
                overallStats.currentShiftRemaining.extendedDrivesUsedThisWeek >= 1 
                  ? 'bg-amber-500 border-amber-400' 
                  : 'bg-slate-200 border-slate-300'
              }`} />
              <div className={`flex-1 h-2.5 rounded-full border ${
                overallStats.currentShiftRemaining.extendedDrivesUsedThisWeek >= 2 
                  ? 'bg-amber-500 border-amber-400' 
                  : 'bg-slate-200 border-slate-300'
              }`} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="font-medium">Zkrácené odpočinky (&lt;11h):</span>
              <span className="font-bold text-slate-700">
                {overallStats.currentShiftRemaining.reducedRestsUsedThisWeek} ze 3
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className={`flex-1 h-2 rounded-full border ${
                overallStats.currentShiftRemaining.reducedRestsUsedThisWeek >= 1 ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-200 border-slate-300'
              }`} />
              <div className={`flex-1 h-2 rounded-full border ${
                overallStats.currentShiftRemaining.reducedRestsUsedThisWeek >= 2 ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-200 border-slate-300'
              }`} />
              <div className={`flex-1 h-2 rounded-full border ${
                overallStats.currentShiftRemaining.reducedRestsUsedThisWeek >= 3 ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-200 border-slate-300'
              }`} />
            </div>
          </div>

          {/* Card 4: Weekly & Bi-Weekly Driving */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Týdenní doba řízení:</span>
              <span className="font-bold text-slate-700">
                {formatMinutes(currentWeek ? currentWeek.totalDrivingMinutes : 0)} / 56h
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((currentWeek ? currentWeek.totalDrivingMinutes : 0) / (56 * 60)) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="font-medium">Dvoutýdenní limit:</span>
              <span className="font-bold text-slate-700">Max 90h</span>
            </div>
            <p className="text-[11px] text-slate-500">
              V jakýchkoliv dvou po sobě jdoucích týdnech max 90 hodin.
            </p>
          </div>

        </div>
      </div>

      {/* Row 4: Infraction Alerts & Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Detected Infractions Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-base text-slate-800">
                Zjištěné legislativní přestupky ({allInfractions.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('infractions')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Všechny detaily</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {allInfractions.length === 0 ? (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-800 text-sm">Gratulujeme! Žádné přestupky nebyly nalezeny.</h4>
              <p className="text-xs text-emerald-700/90 max-w-md mx-auto">
                Všechny jízdy, bezpečnostní přestávky, denní a týdenní odpočinky byly v naprostém souladu s Nařízením (ES) 561/2006.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {allInfractions.map((inf, idx) => (
                <div
                  key={inf.id || idx}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        inf.severity === 'MINOR' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : inf.severity === 'SERIOUS'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {inf.severityLabelCz}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{inf.dateStr} v {inf.timeStr}</span>
                    </div>
                    <span className="text-xs font-mono text-rose-600 font-bold">
                      {inf.fineEstimateCZK}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-800">
                    {inf.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {inf.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 28-Day Activity Stats */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">Celková bilance (28 dní)</h3>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600" />
                <span className="text-xs font-medium text-slate-700">Celková doba řízení:</span>
              </div>
              <span className="font-bold text-sm text-slate-800 font-mono">
                {overallStats.totalDrivingHours} h
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-slate-700">Jiná práce (nakládka, údržba):</span>
              </div>
              <span className="font-bold text-sm text-slate-800 font-mono">
                {overallStats.totalWorkHours} h
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-700">Doba odpočinku a přestávek:</span>
              </div>
              <span className="font-bold text-sm text-slate-800 font-mono">
                {overallStats.totalRestHours} h
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">Celkem ujeto (tachograf):</span>
              </div>
              <span className="font-bold text-sm text-slate-800 font-mono">
                {overallStats.totalKmDriven.toLocaleString('cs-CZ')} km
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab('timeline')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Otevřít interaktivní denní časovou osu</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
