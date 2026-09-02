import React from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Calendar,
  Building
} from 'lucide-react';
import { FullTachographData } from '../types/tachograph';
import { formatMinutes } from '../utils/legislationEngine';

interface InspectionProtocolTabProps {
  data: FullTachographData;
}

export const InspectionProtocolTab: React.FC<InspectionProtocolTabProps> = ({ data }) => {
  const { driver, days, overallStats, allInfractions, weeks } = data;
  const isClean = allInfractions.length === 0;

  const startDate = days[0]?.dateStr || '';
  const endDate = days[days.length - 1]?.dateStr || '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Control Bar (Hidden on print) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Kontrolní protokol o vyhodnocení karty řidiče (EU 561/2006)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Oficiální formát protokolu připravený pro tisk, archivaci dopravce nebo obhajobu při silniční kontrole.
          </p>
        </div>

        <button
          onClick={handlePrint}
          id="btn-print-protocol"
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Vytisknout / Uložit do PDF</span>
        </button>
      </div>

      {/* Printable Sheet (Standard A4 layout styling) */}
      <div className="bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto space-y-8 font-sans">
        
        {/* Protocol Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight uppercase">
              <span>PROTOKOL O SILNIČNÍ / PODNIKOVÉ KONTROLE</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mt-1">
              Vyhodnocení dat digitálního tachografu dle Nařízení EP a Rady (ES) č. 561/2006 a AETR
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Číslo protokolu: TG-{new Date().getFullYear()}-{driver.cardNumber.slice(-6)} • Datum auditu: {new Date().toLocaleDateString('cs-CZ')}
            </p>
          </div>

          <div className="text-right">
            <div className="inline-block border-2 border-slate-900 px-3 py-1 text-center font-bold text-xs uppercase">
              TACHOGUARD PRO
            </div>
          </div>
        </div>

        {/* Driver & Card Identification Box */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
              Identifikace řidiče a karty
            </h4>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Příjmení a jméno:</span>
              <span className="col-span-2 font-bold text-slate-900">{driver.driverSurname} {driver.driverFirstNames}</span>
              
              <span className="text-slate-500">Číslo karty:</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">{driver.cardNumber}</span>

              <span className="text-slate-500">Datum narození:</span>
              <span className="col-span-2 text-slate-800">{driver.birthDate}</span>

              <span className="text-slate-500">Stát a úřad:</span>
              <span className="col-span-2 text-slate-800">{driver.issuingState}, {driver.issuingAuthority}</span>

              <span className="text-slate-500">Platnost karty:</span>
              <span className="col-span-2 text-slate-800">{driver.cardIssueDate} do {driver.cardExpiryDate}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-300 pb-1">
              Rozsah a parametry kontroly
            </h4>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500">Kontrolované období:</span>
              <span className="col-span-2 font-bold text-slate-900">{startDate} až {endDate} ({days.length} dní)</span>

              <span className="text-slate-500">Celková jízda:</span>
              <span className="col-span-2 font-bold text-slate-900 font-mono">{overallStats.totalDrivingHours} hodin</span>

              <span className="text-slate-500">Ujeté kilometry:</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">{overallStats.totalKmDriven.toLocaleString('cs-CZ')} km</span>

              <span className="text-slate-500">Výsledek auditu:</span>
              <span className={`col-span-2 font-bold ${isClean ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isClean ? '100% SHODA (BEZ POKUT)' : `${allInfractions.length} ZJIŠTĚNÝCH PŘESTUPKŮ`}
              </span>

              <span className="text-slate-500">Index shody:</span>
              <span className="col-span-2 font-bold text-slate-900">{overallStats.complianceScore} %</span>
            </div>
          </div>
        </div>

        {/* Legislative Rule Check Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            1. Souhrnné vyhodnocení zákonných požadavků (ES č. 561/2006)
          </h4>
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                <th className="py-2 px-3 border-r border-slate-300">Pravidlo / Článek</th>
                <th className="py-2 px-3 border-r border-slate-300">Zákonný limit</th>
                <th className="py-2 px-3 border-r border-slate-300">Stav</th>
                <th className="py-2 px-3">Zjištěná odchylka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-3 border-r border-slate-300 font-semibold">Čl. 7 – Nepřetržitá doba řízení</td>
                <td className="py-2 px-3 border-r border-slate-300">Max. 4h 30m před přestávkou 45m</td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {allInfractions.some(i => i.type === 'CONTINUOUS_DRIVE_EXCEEDED') ? (
                    <span className="font-bold text-rose-600">PŘESTUPEK</span>
                  ) : (
                    <span className="font-bold text-emerald-600">VYHOVUJE</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-700">
                  {allInfractions.find(i => i.type === 'CONTINUOUS_DRIVE_EXCEEDED')?.excessStr || 'V normě'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-300 font-semibold">Čl. 6 odst. 1 – Denní doba řízení</td>
                <td className="py-2 px-3 border-r border-slate-300">Max. 9h (max. 2x týdně 10h)</td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {allInfractions.some(i => i.type === 'DAILY_DRIVE_EXCEEDED' || i.type === 'MAX_10H_DRIVES_EXCEEDED') ? (
                    <span className="font-bold text-rose-600">PŘESTUPEK</span>
                  ) : (
                    <span className="font-bold text-emerald-600">VYHOVUJE</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-700">
                  {allInfractions.find(i => i.type === 'DAILY_DRIVE_EXCEEDED')?.excessStr || 'V normě'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-300 font-semibold">Čl. 8 odst. 2 – Denní odpočinek</td>
                <td className="py-2 px-3 border-r border-slate-300">Min. 11h (zkrácený 9h max 3x)</td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {allInfractions.some(i => i.type === 'DAILY_REST_INSUFFICIENT' || i.type === 'MAX_REDUCED_RESTS_EXCEEDED') ? (
                    <span className="font-bold text-rose-600">PŘESTUPEK</span>
                  ) : (
                    <span className="font-bold text-emerald-600">VYHOVUJE</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-700">
                  {allInfractions.find(i => i.type === 'DAILY_REST_INSUFFICIENT')?.excessStr || 'V normě'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-300 font-semibold">Čl. 6 odst. 2 – Týdenní doba řízení</td>
                <td className="py-2 px-3 border-r border-slate-300">Max. 56 hodin v kalendářním týdnu</td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {allInfractions.some(i => i.type === 'WEEKLY_DRIVE_EXCEEDED') ? (
                    <span className="font-bold text-rose-600">PŘESTUPEK</span>
                  ) : (
                    <span className="font-bold text-emerald-600">VYHOVUJE</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-700">
                  {allInfractions.find(i => i.type === 'WEEKLY_DRIVE_EXCEEDED')?.excessStr || 'V normě'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-300 font-semibold">Čl. 6 odst. 3 – Dvoutýdenní doba řízení</td>
                <td className="py-2 px-3 border-r border-slate-300">Max. 90 hodin za 2 po sobě jdoucí týdny</td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {allInfractions.some(i => i.type === 'BIWEEKLY_DRIVE_EXCEEDED') ? (
                    <span className="font-bold text-rose-600">PŘESTUPEK</span>
                  ) : (
                    <span className="font-bold text-emerald-600">VYHOVUJE</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-700">
                  {allInfractions.find(i => i.type === 'BIWEEKLY_DRIVE_EXCEEDED')?.excessStr || 'V normě'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Infractions Details Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            2. Seznam zjištěných porušení a odhad sankcí
          </h4>

          {allInfractions.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center">
              V kontrolovaném 28denním období nebyl zjištěn žádný přestupek proti pravidlům 561/2006.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <th className="py-2 px-2.5 border-r border-slate-300">Datum a čas</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Ustanovení</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Závažnost</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Zjištění</th>
                  <th className="py-2 px-2.5">Sankce (ČR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allInfractions.map((inf) => (
                  <tr key={inf.id} className="text-[11px]">
                    <td className="py-2 px-2.5 border-r border-slate-300 font-mono whitespace-nowrap">
                      {inf.dateStr} {inf.timeStr}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 font-semibold whitespace-nowrap">
                      {inf.articleRef}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 font-bold text-rose-700 whitespace-nowrap">
                      {inf.severityLabelCz}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-300 text-slate-700">
                      <strong>{inf.title}</strong>: {inf.description} (Naměřeno: {inf.measuredValueStr})
                    </td>
                    <td className="py-2 px-2.5 font-bold font-mono whitespace-nowrap text-slate-900">
                      {inf.fineEstimateCZK}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Legal Disclaimer & Signatures */}
        <div className="pt-4 border-t border-slate-300 space-y-6 text-xs text-slate-600">
          <p className="text-[11px] leading-relaxed">
            Vyhodnocení proběhlo na základě kryptografických a binárních dat zaznamenaných na čipu digitální karty řidiče dle specifikace EU 2016/799 a Nařízení (ES) 561/2006. V případě mimořádných okolností (dopravní zácpa, nouzové hledání bezpečného místa pro parkování dle Článku 12) musí být k tomuto protokolu přiložen ručně podepsaný výtisk z tachografu s odůvodněním.
          </p>

          <div className="grid grid-cols-2 gap-12 pt-6">
            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-900 block">{driver.driverSurname} {driver.driverFirstNames}</span>
              <span className="text-[11px] text-slate-500">Podpis kontrolovaného řidiče</span>
            </div>

            <div className="border-t border-slate-400 pt-2 text-center">
              <span className="font-bold text-slate-900 block">TachoGuard Analytický Systém</span>
              <span className="text-[11px] text-slate-500">Razítko a podpis hodnotitele / dispečera</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
