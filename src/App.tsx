import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { TimelineTab } from './components/TimelineTab';
import { WeeklyTab } from './components/WeeklyTab';
import { InfractionsTab } from './components/InfractionsTab';
import { InspectionProtocolTab } from './components/InspectionProtocolTab';
import { LegislationGuideTab } from './components/LegislationGuideTab';
import { EmptyStateView } from './components/EmptyStateView';
import { CardReaderModal } from './components/CardReaderModal';
import { HardwareWatcherModal } from './components/HardwareWatcherModal';
import { FullTachographData } from './types/tachograph';
import { useCardReaderStatus } from './utils/useCardReader';
import { 
  CheckCircle2, 
  FileDown, 
  Usb, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  PowerOff, 
  Radio,
  RefreshCw,
  Info,
  Cpu,
  Activity
} from 'lucide-react';

export default function App() {
  // Cleared by default: user starts with empty state ready to read card or upload file
  const [tachographData, setTachographData] = useState<FullTachographData | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'timeline' | 'weekly' | 'infractions' | 'protocol' | 'guide'
  >('overview');

  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [isWatcherModalOpen, setIsWatcherModalOpen] = useState(false);
  const [readerModalTab, setReaderModalTab] = useState<'usb' | 'file' | 'samples'>('usb');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Card & Hardware Reader Status Hook
  const {
    readerConnected,
    readerName,
    cardInserted,
    cardAtr,
    statusLog,
    ejectCard,
    insertCard,
    toggleCard,
    checkHardware,
    pairUsbDevice
  } = useCardReaderStatus(!!tachographData);

  const handleDataLoaded = (newData: FullTachographData) => {
    setTachographData(newData);
    insertCard();
    setToastMessage(`Karta řidiče ${newData.driver.driverSurname} ${newData.driver.driverFirstNames} byla úspěšně načtena.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleEjectCard = () => {
    ejectCard();
    setToastMessage('🔴 KARTA VYJMUTA – Karta byla vysunuta ze slotu čtečky.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleClearData = () => {
    setTachographData(null);
    setToastMessage('Data byla vymazána a relace resetována.');
    setTimeout(() => {
      setToastMessage(null), 3500;
    });
  };

  const handleInsertCard = () => {
    insertCard();
    setToastMessage('🟢 KARTA VLOŽENA – Čip je aktivní a připraven k vyčtení.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const openReaderWithTab = (tab: 'usb' | 'file' | 'samples' = 'usb') => {
    setReaderModalTab(tab);
    setIsReaderModalOpen(true);
  };

  const startDate = tachographData?.days[0]?.dateStr || '';
  const endDate = tachographData?.days[tachographData.days.length - 1]?.dateStr || '';
  const isClean = tachographData ? tachographData.allInfractions.length === 0 : true;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tachographData={tachographData}
        cardInserted={cardInserted}
        readerConnected={readerConnected}
        cardAtr={cardAtr}
        onToggleCard={toggleCard}
        onInsertCard={handleInsertCard}
        onEjectCard={handleEjectCard}
        onClearData={handleClearData}
        onOpenReaderModal={() => openReaderWithTab('usb')}
        onOpenWatcherModal={() => setIsWatcherModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Professional Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs no-print">
          <div className="min-w-0 pr-4">
            {tachographData ? (
              <>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                    Karta řidiče: {tachographData.driver.driverSurname} {tachographData.driver.driverFirstNames}
                  </h1>
                  
                  {/* High-visibility live badge in header */}
                  <button
                    onClick={() => setIsWatcherModalOpen(true)}
                    className="cursor-pointer"
                    title="Klikněte pro zobrazení živého hlídače čtečky"
                  >
                    {cardInserted ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs hover:bg-emerald-100 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 🟢 VLOŽENA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs hover:bg-amber-100 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> 🔴 VYJMUTA
                      </span>
                    )}
                  </button>

                  {isClean ? (
                    <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Bez přestupků
                    </span>
                  ) : (
                    <span className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> {tachographData.allInfractions.length} přestupky
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                  <span>Období: {startDate} – {endDate}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-400 text-xs">Číslo: {tachographData.driver.cardNumber}</span>
                </p>
              </>
            ) : (
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                    TachoGuard Pro • Digitální kontrola karty řidiče
                  </h1>
                  <button
                    onClick={() => setIsWatcherModalOpen(true)}
                    className="cursor-pointer"
                    title="Klikněte pro zobrazení živého hlídače čtečky"
                  >
                    {cardInserted ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 🟢 VLOŽENA
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> 🔴 VYJMUTA
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  {cardInserted 
                    ? 'Karta řidiče je vložena ve čtečce – připraveno ke čtení dat' 
                    : 'Karta je vysunuta ze čtečky – čeká na zasunutí do slotu'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Card Presence Switch button in header */}
            <button
              onClick={toggleCard}
              id="btn-header-toggle-card-state"
              className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 ${
                cardInserted
                  ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900'
                  : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900'
              }`}
              title="Přepnout stav zasunutí/vyjmutí karty z USB čtečky"
            >
              {cardInserted ? (
                <>
                  <PowerOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vyjmout kartu</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zasunout kartu</span>
                </>
              )}
            </button>

            {tachographData ? (
              <>
                <button
                  onClick={() => setActiveTab('protocol')}
                  id="btn-header-export-pdf"
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <FileDown className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Exportovat PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <button
                  onClick={() => openReaderWithTab('usb')}
                  id="btn-header-new-read"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-medium shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Usb className="w-4 h-4" />
                  <span>Změnit kartu</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => openReaderWithTab('usb')}
                id="btn-header-new-read"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Usb className="w-4 h-4" />
                <span>Načíst kartu</span>
              </button>
            )}
          </div>
        </header>

        {/* Card Ejected Notification Banner while viewing data */}
        {tachographData && !cardInserted && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <PowerOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Karta byla vyjmuta ze čtečky USB.</strong> Prohlížíte data v offline režimu analýzy.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInsertCard}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
              >
                Znovu zasunout kartu
              </button>
              <button
                onClick={handleClearData}
                className="px-2.5 py-1 rounded bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-medium text-xs cursor-pointer"
              >
                Vymazat data
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 space-y-6">
          {tachographData ? (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  data={tachographData}
                  cardInserted={cardInserted}
                  onToggleCard={toggleCard}
                  onInsertCard={handleInsertCard}
                  onEjectCard={handleEjectCard}
                  onNavigateToTab={setActiveTab}
                  onOpenReaderModal={() => openReaderWithTab('usb')}
                  onUpdateDriver={(updatedDriver) => {
                    setTachographData(prev => prev ? ({ ...prev, driver: updatedDriver }) : null);
                    setToastMessage(`Údaje řidiče byly aktualizovány: ${updatedDriver.driverSurname} ${updatedDriver.driverFirstNames}`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineTab data={tachographData} />
              )}

              {activeTab === 'weekly' && (
                <WeeklyTab data={tachographData} />
              )}

              {activeTab === 'infractions' && (
                <InfractionsTab
                  data={tachographData}
                  onNavigateToProtocol={() => setActiveTab('protocol')}
                />
              )}

              {activeTab === 'protocol' && (
                <InspectionProtocolTab data={tachographData} />
              )}

              {activeTab === 'guide' && (
                <LegislationGuideTab />
              )}
            </>
          ) : (
            <>
              {activeTab === 'guide' ? (
                <LegislationGuideTab />
              ) : (
                <EmptyStateView
                  cardInserted={cardInserted}
                  readerConnected={readerConnected}
                  onToggleCard={toggleCard}
                  onInsertCard={handleInsertCard}
                  onEjectCard={handleEjectCard}
                  onCheckHardware={checkHardware}
                  onOpenReaderModal={openReaderWithTab}
                  onDataLoaded={handleDataLoaded}
                />
              )}
            </>
          )}
        </main>

        {/* Professional Footer */}
        <footer className="no-print border-t border-slate-200 bg-white py-4 px-6 sm:px-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">
              T
            </div>
            <span className="font-semibold text-slate-700">TachoGuard Pro</span>
            <span className="text-slate-400">| Analýza dle nařízení (ES) č. 561/2006 & Balíčku mobility I</span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            Podpora USB čteček ISO 7816 / .DDD .ESM .TGD .C1B
          </div>
        </footer>

      </div>

      {/* USB & File Reader Modal */}
      <CardReaderModal
        isOpen={isReaderModalOpen}
        initialTab={readerModalTab}
        cardInserted={cardInserted}
        onToggleCard={toggleCard}
        onInsertCard={handleInsertCard}
        onEjectCard={handleEjectCard}
        onClose={() => setIsReaderModalOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Hardware Watcher & In-App Slot Monitor Modal */}
      <HardwareWatcherModal
        isOpen={isWatcherModalOpen}
        cardInserted={cardInserted}
        readerConnected={readerConnected}
        readerName={readerName}
        cardAtr={cardAtr}
        statusLog={statusLog}
        onClose={() => setIsWatcherModalOpen(false)}
        onToggleCard={toggleCard}
        onInsertCard={handleInsertCard}
        onEjectCard={handleEjectCard}
        onCheckHardware={checkHardware}
        onPairUsb={pairUsbDevice}
      />

    </div>
  );
}
