import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Filter, 
  Scale, 
  Banknote, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { FullTachographData, Infraction, InfractionSeverity } from '../types/tachograph';

interface InfractionsTabProps {
  data: FullTachographData;
  onNavigateToProtocol: () => void;
}

export const InfractionsTab: React.FC<InfractionsTabProps> = ({
  data,
  onNavigateToProtocol
}) => {
  const infractions = data.allInfractions;
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredInfractions = infractions.filter(inf => {
    if (selectedSeverity === 'ALL') return true;
    return inf.severity === selectedSeverity;
  });

  const getSeverityStyle = (severity: InfractionSeverity) => {
    switch (severity) {
      case 'MINOR':
        return {
          bg: 'bg-amber-50/60',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          border: 'border-amber-200',
          textColor: 'text-amber-800'
        };
      case 'SERIOUS':
        return {
          bg: 'bg-orange-50/60',
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          border: 'border-orange-200',
          textColor: 'text-orange-800'
        };
      case 'VERY_SERIOUS':
        return {
          bg: 'bg-rose-50/60',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          border: 'border-rose-200',
          textColor: 'text-rose-800'
        };
      case 'MOST_SERIOUS':
        return {
          bg: 'bg-rose-100/60',
          badge: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
          border: 'border-rose-300',
          textColor: 'text-rose-950'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Katalog zjištěných přestupků a sazebník pokut</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Klasifikace závažnosti podle Směrnice EU 2016/403 a zákona č. 111/1994 Sb. o silniční dopravě.
          </p>
        </div>

        <button
          onClick={onNavigateToProtocol}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-indigo-200"
        >
          <FileText className="w-4 h-4" />
          <span>Generovat kontrolní protokol</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedSeverity('ALL')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            selectedSeverity === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Všechny přestupky ({infractions.length})
        </button>

        <button
          onClick={() => setSelectedSeverity('MINOR')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            selectedSeverity === 'MINOR'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Lehké (MI) ({infractions.filter(i => i.severity === 'MINOR').length})
        </button>

        <button
          onClick={() => setSelectedSeverity('SERIOUS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            selectedSeverity === 'SERIOUS'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Závažné (SI) ({infractions.filter(i => i.severity === 'SERIOUS').length})
        </button>

        <button
          onClick={() => setSelectedSeverity('VERY_SERIOUS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            selectedSeverity === 'VERY_SERIOUS'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Velmi závažné (VSI) ({infractions.filter(i => i.severity === 'VERY_SERIOUS').length})
        </button>

        <button
          onClick={() => setSelectedSeverity('MOST_SERIOUS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            selectedSeverity === 'MOST_SERIOUS'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Nejzávažnější (MSI) ({infractions.filter(i => i.severity === 'MOST_SERIOUS').length})
        </button>
      </div>

      {/* Infractions List */}
      {filteredInfractions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base text-slate-800">
            Ve vybrané kategorii nebyly nalezeny žádné přestupky
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Karta řidiče splňuje v této kategorii všechny zákonné požadavky Nařízení (ES) 561/2006.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInfractions.map((inf) => {
            const styles = getSeverityStyle(inf.severity);

            return (
              <div
                key={inf.id}
                className={`bg-white border ${styles.border} rounded-xl p-6 shadow-sm space-y-4 transition-all`}
              >
                {/* Infraction Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${styles.badge}`}>
                        {inf.severityLabelCz}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Datum: <strong className="text-slate-700">{inf.dateStr}</strong> v <strong className="text-slate-700">{inf.timeStr}</strong>
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {inf.articleRef}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-800 pt-1">
                      {inf.title}
                    </h4>
                  </div>

                  {/* Fines estimates */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right">
                    <span className="text-[11px] text-slate-500 block font-medium">Orientační sankce:</span>
                    <div className="font-mono font-bold text-sm text-rose-600">
                      {inf.fineEstimateCZK}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      v EU: {inf.fineEstimateEUR} {inf.pointsCZ ? `• ${inf.pointsCZ} body v ČR` : ''}
                    </span>
                  </div>
                </div>

                {/* Infraction Parameters Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-medium">Zjištěná hodnota:</span>
                    <span className="font-bold text-rose-600 text-sm font-mono">{inf.measuredValueStr}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-medium">Zákonný limit (561/2006):</span>
                    <span className="font-bold text-slate-700 text-sm font-mono">{inf.legalLimitStr}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-medium">Rozdíl / Překročení:</span>
                    <span className="font-bold text-amber-600 text-sm font-mono">{inf.excessStr}</span>
                  </div>
                </div>

                {/* Description and Advice */}
                <div className="space-y-3 pt-1 text-xs">
                  <div className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Popis zjištění:</span>
                    {inf.description}
                  </div>

                  <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl text-slate-700 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                      <Info className="w-4 h-4" />
                      <span>Doporučení pro řidiče & obrana při kontrole:</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {inf.recommendation}
                    </p>
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      💡 Tip: Pokud došlo k překročení z důvodu hledání bezpečného parkoviště nebo neočekávané dopravní situace, nezapomeňte vytisknout výtisk z digitálního tachografu a na zadní stranu ručně zapsat důvod dle Článku 12 Nařízení (ES) 561/2006.
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
