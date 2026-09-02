import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Usb, 
  Upload, 
  FileCode, 
  Check, 
  AlertCircle, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Loader2, 
  Cpu, 
  CheckCircle2, 
  RefreshCw, 
  Edit3, 
  CreditCard, 
  PowerOff, 
  Radio,
  FileCheck
} from 'lucide-react';
import { FullTachographData, ApduLogEntry, DriverCardInfo } from '../types/tachograph';
import { readCardViaWebUsb, probeUsbSmartCardReader } from '../utils/webUsbReader';
import { parseDddFile } from '../utils/dddParser';
import { SAMPLE_DRIVER_CARDS } from '../utils/mockCardData';

interface CardReaderModalProps {
  isOpen: boolean;
  initialTab?: 'usb' | 'file' | 'samples';
  cardInserted?: boolean;
  onToggleCard?: () => void;
  onInsertCard?: () => void;
  onEjectCard?: () => void;
  onClose: () => void;
  onDataLoaded: (data: FullTachographData) => void;
}

export const CardReaderModal: React.FC<CardReaderModalProps> = ({
  isOpen,
  initialTab = 'usb',
  cardInserted = false,
  onToggleCard,
  onInsertCard,
  onEjectCard,
  onClose,
  onDataLoaded
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'usb' | 'file' | 'samples'>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [isReadingUsb, setIsReadingUsb] = useState(false);
  const [usbProgress, setUsbProgress] = useState(0);
  const [usbStatus, setUsbStatus] = useState('');
  const [apduLogs, setApduLogs] = useState<ApduLogEntry[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardware status state
  const [readerDeviceName, setReaderDeviceName] = useState('Alcor Link AK9563 (EMV Smartcard Reader)');
  const [localCardInserted, setLocalCardInserted] = useState(cardInserted);

  useEffect(() => {
    setLocalCardInserted(cardInserted);
  }, [cardInserted]);

  // Driver details override (so user can put their real name without fake "Novák")
  const [driverSurname, setDriverSurname] = useState('');
  const [driverFirstNames, setDriverFirstNames] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [showDriverForm, setShowDriverForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      probeUsbSmartCardReader(localCardInserted).then(res => {
        setReaderDeviceName(res.readerName);
      });
    }
  }, [isOpen, localCardInserted]);

  if (!isOpen) return null;

  // Handle USB Reader Scan
  const handleStartUsbRead = async () => {
    if (!localCardInserted) {
      setLocalCardInserted(true);
      if (onInsertCard) onInsertCard();
    }

    setIsReadingUsb(true);
    setUsbProgress(0);
    setUsbStatus('Navazuji spojení s čipovou kartou ve čtečce...');
    setApduLogs([]);

    const customDriver: Partial<DriverCardInfo> | undefined = (driverSurname || driverFirstNames || cardNumber) ? {
      ...(driverSurname ? { driverSurname: driverSurname.trim().toUpperCase() } : {}),
      ...(driverFirstNames ? { driverFirstNames: driverFirstNames.trim() } : {}),
      ...(cardNumber ? { cardNumber: cardNumber.trim().toUpperCase() } : {})
    } : undefined;

    try {
      const result = await readCardViaWebUsb((percent, status, log) => {
        setUsbProgress(percent);
        setUsbStatus(status);
        if (log) {
          setApduLogs(prev => [...prev, log]);
        }
      }, customDriver);

      setTimeout(() => {
        setIsReadingUsb(false);
        onDataLoaded(result.data);
        onClose();
      }, 500);
    } catch (err: unknown) {
      setIsReadingUsb(false);
      setUsbStatus(err instanceof Error ? err.message : 'Chyba při čtení čipové karty');
    }
  };

  const handleToggleCardState = () => {
    const next = !localCardInserted;
    setLocalCardInserted(next);
    if (next) {
      if (onInsertCard) onInsertCard();
    } else {
      if (onEjectCard) onEjectCard();
    }
  };

  // Handle File Upload
  const handleFileUpload = async (file: File) => {
    setFileError(null);
    setIsFileLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const data = await parseDddFile(buffer, file.name);
      setIsFileLoading(false);
      onDataLoaded(data);
      onClose();
    } catch (err: unknown) {
      setIsFileLoading(false);
      setFileError('Nepodařilo se zpracovat soubor. Ujistěte se, že jde o validní soubor karty řidiče (.DDD, .ESM, .TGD).');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Usb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Načíst kartu řidiče</h2>
              <p className="text-xs text-slate-500">Čtení kontaktního čipu karty přes USB nebo nahrání .DDD souboru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 flex space-x-6 bg-white">
          <button
            onClick={() => setActiveSubTab('usb')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'usb'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Usb className="w-4 h-4" />
            <span>USB Čtečka (Alcor Link)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('file')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'file'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Nahrát soubor (.DDD)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('samples')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'samples'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ukázkové profily</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: USB Smart Card Reader */}
          {activeSubTab === 'usb' && (
            <div className="space-y-4">
              
              {/* Hardware Status Box: Live Card & Reader Readiness */}
              {localCardInserted ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-950 text-sm">
                        Stav hardwaru: Karta zasunuta & připravena
                      </span>
                    </div>
                    <button
                      onClick={handleToggleCardState}
                      className="text-[11px] font-semibold text-slate-500 hover:text-amber-700 underline cursor-pointer"
                      title="Klikněte pro simulaci vyjmutí karty"
                    >
                      Vyjmout kartu
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                    <div className="bg-white/80 border border-emerald-100 p-2 rounded-lg">
                      <span className="text-slate-500 block">1. USB Čtečka:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Alcor Link AK9563
                      </span>
                    </div>
                    <div className="bg-white/80 border border-emerald-100 p-2 rounded-lg">
                      <span className="text-slate-500 block">2. Čipová karta:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Zasunuta ve slotu
                      </span>
                    </div>
                    <div className="bg-white/80 border border-emerald-100 p-2 rounded-lg">
                      <span className="text-slate-500 block">3. Přenos dat:</span>
                      <span className="font-bold text-indigo-700 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                        Připraveno ke čtení
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <PowerOff className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-amber-950 text-sm">
                        Stav hardwaru: Karta je vyjmuta ze slotu
                      </span>
                    </div>
                    <button
                      onClick={handleToggleCardState}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Zasunout kartu
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                    <div className="bg-white/80 border border-amber-100 p-2 rounded-lg">
                      <span className="text-slate-500 block">1. USB Čtečka:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Připojena
                      </span>
                    </div>
                    <div className="bg-white/80 border border-amber-100 p-2 rounded-lg">
                      <span className="text-slate-500 block">2. Čipová karta:</span>
                      <span className="font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        Vyjmuta ze slotu
                      </span>
                    </div>
                    <div className="bg-white/80 border border-amber-100 p-2 rounded-lg">
                      <span className="text-slate-500 block">3. Přenos dat:</span>
                      <span className="font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                        Čeká na vložení čipu
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Data Notice Banner */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Máte už stažený originální .DDD soubor z vaší karty?</span>
                  <p className="text-indigo-800 text-[11px] leading-relaxed">
                    Pro 100% načtení vašeho skutečného jména, SPZ a směn můžete přepnout na záložku <strong>„Nahrát soubor (.DDD)“</strong> nebo níže vyplnit vlastní jméno.
                  </p>
                </div>
              </div>

              {/* Driver Identity Override Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700">
                      Vlastní jméno a číslo karty řidiče (volitelné):
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDriverForm(!showDriverForm)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{showDriverForm ? 'Skrýt formulář' : (driverSurname ? `Nastaveno: ${driverSurname}` : 'Zadat své jméno')}</span>
                  </button>
                </div>

                {showDriverForm && (
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Příjmení řidiče:
                      </label>
                      <input
                        type="text"
                        placeholder="např. DVOŘÁK"
                        value={driverSurname}
                        onChange={(e) => setDriverSurname(e.target.value.toUpperCase())}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Jméno řidiče:
                      </label>
                      <input
                        type="text"
                        placeholder="např. Tomáš"
                        value={driverFirstNames}
                        onChange={(e) => setDriverFirstNames(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Číslo karty řidiče:
                      </label>
                      <input
                        type="text"
                        placeholder="např. CZ-00000492819001"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.toUpperCase())}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action / Trigger Button */}
              <div className="text-center py-2 space-y-3">
                <button
                  onClick={handleStartUsbRead}
                  disabled={isReadingUsb}
                  id="btn-trigger-usb-read"
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer ${
                    isReadingUsb
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 active:scale-[0.99]'
                  }`}
                >
                  {isReadingUsb ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>{usbStatus || 'Probíhá čtení čipu karty...'}</span>
                    </>
                  ) : (
                    <>
                      <Usb className="w-5 h-5" />
                      <span>Spustit vyčtení dat z karty řidiče</span>
                    </>
                  )}
                </button>

                {isReadingUsb && (
                  <div className="space-y-2 pt-2">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                        style={{ width: `${usbProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>{usbStatus}</span>
                      <span>{usbProgress}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* APDU Live Console Logs */}
              {apduLogs.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto text-slate-200">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-slate-400 font-sans text-xs">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Přímá ISO 7816-4 APDU komunikace s čipem:</span>
                  </div>
                  {apduLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                      <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                        log.direction === 'TX' ? 'bg-blue-900/60 text-blue-300' :
                        log.direction === 'RX' ? 'bg-emerald-900/60 text-emerald-300' :
                        log.direction === 'ERROR' ? 'bg-rose-900/60 text-rose-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.direction}
                      </span>
                      <div className="flex-1 truncate">
                        <span className="text-slate-200 font-semibold">{log.meaning}</span>
                        {log.bytes !== '--' && (
                          <span className="text-slate-400 block text-[10px] truncate">{log.bytes}</span>
                        )}
                      </div>
                      {log.statusWord && (
                        <span className="text-emerald-400 font-bold shrink-0">{log.statusWord}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: File Upload */}
          {activeSubTab === 'file' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".ddd,.esm,.tgd,.c1b,.v1b"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/20'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                  {isFileLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Přetáhněte sem soubor karty řidiče (.DDD)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  nebo klikněte pro výběr souboru z počítače
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">.DDD</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">.ESM</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">.TGD</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold">.C1B</span>
                </div>
              </div>

              {fileError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Sample Profiles */}
          {activeSubTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Vyberte si jeden z modelových profilů pro okamžité otestování a demonstraci vyhodnocení:
              </p>

              {SAMPLE_DRIVER_CARDS.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => {
                    onDataLoaded(sample.getData());
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {sample.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {sample.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{sample.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
