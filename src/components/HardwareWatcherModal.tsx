import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  PowerOff, 
  Activity, 
  ShieldCheck,
  RefreshCw,
  Usb,
  Check
} from 'lucide-react';

interface HardwareWatcherModalProps {
  isOpen: boolean;
  cardInserted: boolean;
  readerConnected: boolean;
  bridgeConnected?: boolean;
  readerName: string;
  cardAtr: string | null;
  statusLog: Array<{ time: string; state: 'INSERTED' | 'EJECTED'; message: string }>;
  onClose: () => void;
  onToggleCard: () => void;
  onInsertCard: () => void;
  onEjectCard: () => void;
  onCheckHardware?: () => void;
  onPairUsb?: () => Promise<boolean>;
}

export const HardwareWatcherModal: React.FC<HardwareWatcherModalProps> = ({
  isOpen,
  cardInserted,
  readerConnected,
  bridgeConnected = false,
  readerName,
  cardAtr,
  statusLog,
  onClose,
  onToggleCard,
  onInsertCard,
  onEjectCard,
  onCheckHardware,
  onPairUsb
}) => {
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [isPairing, setIsPairing] = useState(false);

  if (!isOpen) return null;

  const handlePair = async () => {
    if (onPairUsb) {
      setIsPairing(true);
      const res = await onPairUsb();
      setIsPairing(false);
      if (res) {
        setPairingSuccess(true);
        setTimeout(() => setPairingSuccess(false), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              cardInserted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Automatický hlídač karty ve čtečce
              </h2>
              <p className="text-xs text-slate-500">
                Nepřetržitá kontrola stavu slotu přímo v aplikaci
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Main Live Indicator Box */}
          <div className={`p-5 rounded-2xl border transition-all ${
            cardInserted 
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20' 
              : 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                  cardInserted ? 'bg-emerald-600' : 'bg-amber-500'
                }`}>
                  {cardInserted ? <Radio className="w-6 h-6 animate-pulse" /> : <PowerOff className="w-6 h-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Aktuální stav:</span>
                    <span className={`text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      cardInserted 
                        ? 'bg-emerald-600 text-white border-emerald-700' 
                        : 'bg-amber-500 text-white border-amber-600'
                    }`}>
                      {cardInserted ? '🟢 VLOŽENA' : '🔴 VYJMUTA'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {cardInserted 
                      ? 'Karta řidiče je vložena ve čtečce. Čip odpovídá a je připraven k vyčtení.' 
                      : 'Slot čtečky je prázdný. Karta je vyjmuta.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={onToggleCard}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    cardInserted 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {cardInserted ? 'Vysunout kartu ze čtečky' : 'Zasunout kartu do čtečky'}
                </button>
              </div>
            </div>

            {/* Sub-info bar */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Detekovaná čtečka</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {readerName}
                </span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Stav USB / Můstek</span>
                <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${bridgeConnected ? 'text-emerald-600' : readerConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${bridgeConnected || readerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  {bridgeConnected ? 'Můstek připojen 🟢' : readerConnected ? 'USB připojeno' : 'Odpojeno'}
                </span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80 truncate">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">3. ATR odpověď čipu</span>
                <span className="font-mono font-bold text-slate-700 text-[11px] truncate block mt-0.5">
                  {cardAtr ? `${cardAtr.slice(0, 18)}...` : (cardInserted ? '3B FE 96 00 00 80...' : 'Žádná karta')}
                </span>
              </div>
            </div>
          </div>

          {/* WebUSB direct browser connection box */}
          {onPairUsb && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                  <Usb className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Přímé WebUSB párování (Alcor Link AK9563)</h4>
                  <p className="text-[11px] text-slate-500">Povolí prohlížeči přímý hardware přístup k USB čtečce bez jakéhokoliv externího softwaru.</p>
                </div>
              </div>

              <button
                onClick={handlePair}
                disabled={isPairing}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {pairingSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Spárováno</span>
                  </>
                ) : (
                  <>
                    <Usb className="w-3.5 h-3.5" />
                    <span>{isPairing ? 'Otevírám...' : 'Povolit čtečku v prohlížeči'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Live History Logs of Insert / Eject Events */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Živý protokol detekce slotu (opakované hlídání):</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {statusLog.length} událostí
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
              {statusLog.length === 0 ? (
                <div className="text-slate-500 text-xs py-2 text-center font-sans">
                  Zatím nebyla zaznamenána žádná změna stavu. Zasuňte nebo vyjměte kartu ze čtečky.
                </div>
              ) : (
                statusLog.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-800/60 p-1.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{entry.time}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        entry.state === 'INSERTED' ? 'bg-emerald-900/80 text-emerald-300' : 'bg-amber-900/80 text-amber-300'
                      }`}>
                        {entry.state === 'INSERTED' ? 'VLOŽENA' : 'VYJMUTA'}
                      </span>
                      <span className="text-slate-300">{entry.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatická kontrola slotu běží nepřetržitě na pozadí aplikace</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Zavřít
          </button>
        </div>

      </div>
    </div>
  );
};
