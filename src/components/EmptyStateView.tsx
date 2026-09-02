import React from 'react';
import { 
  Usb, 
  UploadCloud, 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard,
  Calendar,
  AlertTriangle,
  Clock,
  Award,
  Cpu,
  PowerOff,
  Radio,
  RefreshCw
} from 'lucide-react';
import { FullTachographData } from '../types/tachograph';
import { SAMPLE_DRIVER_CARDS } from '../utils/mockCardData';
import { parseDddFile } from '../utils/dddParser';

interface EmptyStateViewProps {
  cardInserted: boolean;
  readerConnected: boolean;
  onToggleCard: () => void;
  onInsertCard: () => void;
  onEjectCard: () => void;
  onCheckHardware?: () => void;
  onOpenReaderModal: (initialTab?: 'usb' | 'file' | 'samples') => void;
  onDataLoaded: (data: FullTachographData) => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  cardInserted,
  readerConnected,
  onToggleCard,
  onInsertCard,
  onEjectCard,
  onCheckHardware,
  onOpenReaderModal,
  onDataLoaded
}) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseDddFile(buffer, file.name);
      onDataLoaded(parsed);
    } catch (err) {
      console.error('Chyba při čtení souboru:', err);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseDddFile(buffer, file.name);
      onDataLoaded(parsed);
    } catch (err) {
      console.error('Chyba při přetažení souboru:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-fadeIn">
      
      {/* Live Card & Reader Readiness Alert Banner */}
      {cardInserted ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Stav čtečky: Karta řidiče je vložena ve slotu
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Aktivní čip
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                USB čtečka je připravena pro vyčtení dat. Pro spuštění čtení a analýzu klikněte na tlačítko.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={onEjectCard}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              title="Přepnout stav na vyjmutou kartu"
            >
              Vyjmout kartu
            </button>
            <button
              onClick={() => onOpenReaderModal('usb')}
              id="btn-banner-read-usb"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Usb className="w-4 h-4" />
              <span>Načíst zasunutou kartu</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-slate-50 border border-amber-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <PowerOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Stav čtečky: Karta byla vyjmuta (Slot je prázdný)
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Čeká na kartu
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                USB čtečka je připojena k počítači, ale v mechanice není vložena karta řidiče. Zasuňte kartu a klikněte na tlačítko.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={onInsertCard}
              id="btn-banner-insert-card"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Radio className="w-4 h-4" />
              <span>Zasunout kartu do čtečky</span>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Profesionální audit karty řidiče dle Nařízení (ES) č. 561/2006</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight max-w-2xl mx-auto">
          Vyberte způsob načtení karty řidiče
        </h2>

        <p className="text-sm text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed">
          Aplikace provede kompletní 28denní audit časů řízení, bezpečnostních přestávek a odpočinků, 
          detekuje přestupky a spočítá odhad pokut.
        </p>

        {/* Security / Read-Only Guarantee Box */}
        <div className="inline-flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl mt-4">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span><strong>100% Bezpečné čtení:</strong> Čip karty je chráněn hardwarem, data se nikdy nepřepisují ani nemažou.</span>
        </div>
      </div>

      {/* 2 Primary Input Action Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Option 1: USB Smart Card Reader */}
        <div className="bg-white border-2 border-indigo-100 hover:border-indigo-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 mb-4 group-hover:scale-105 transition-transform">
              <Usb className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">
                1. Načíst přes USB čtečku
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                WebUSB
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Připojte jakoukoliv běžnou USB čtečku čipových karet (např. Omnikey, Gemalto, Realtek) s vloženou kartou řidiče. 
              Čtení probíhá protokolem ISO 7816-4 APDU.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onOpenReaderModal('usb')}
              id="btn-empty-read-usb"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Usb className="w-4 h-4" />
              <span>{cardInserted ? 'Spustit čtení z vložené karty' : 'Vložit kartu & spustit čtení'}</span>
            </button>
          </div>
        </div>

        {/* Option 2: Upload Tachograph File (.DDD / .ESM / .TGD) */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-white border-2 border-slate-200 hover:border-indigo-400 border-dashed rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">
                2. Nahrát soubor z karty
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                .DDD / .ESM
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Přetáhněte soubor stažený ze stahovacího klíče nebo firemního terminálu. 
              Podporovány jsou všechny formáty: <span className="font-mono text-slate-700">.DDD, .ESM, .TGD, .C1B, .V1B</span>.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <label 
              htmlFor="empty-state-file-input"
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span>Vybrat soubor z počítače</span>
              <input
                id="empty-state-file-input"
                type="file"
                accept=".ddd,.esm,.tgd,.c1b,.v1b,application/octet-stream"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Option 3: Sample Driver Profiles (Testing & Demo) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Nebo načíst ukázkový profil pro otestování</span>
            </h3>
            <p className="text-xs text-slate-500">
              Vyzkoušejte analýzu na reálných 28denních modelových datech řidičů
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {SAMPLE_DRIVER_CARDS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onDataLoaded(sample.getData())}
              className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {sample.name}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    sample.id === 'petr_svoboda' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : sample.id === 'martin_kovar'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {sample.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{sample.driverInfo.cardNumber}</span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Otevřít <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
