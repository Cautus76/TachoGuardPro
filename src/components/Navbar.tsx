import React, { useState } from 'react';
import { 
  CreditCard, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Usb, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Truck,
  Activity,
  Menu,
  X,
  Trash2,
  LogOut,
  Info,
  RefreshCw,
  Cpu,
  PowerOff,
  Radio,
  ArrowRight
} from 'lucide-react';
import { FullTachographData } from '../types/tachograph';

interface NavbarProps {
  activeTab: 'overview' | 'timeline' | 'weekly' | 'infractions' | 'protocol' | 'guide';
  setActiveTab: (tab: 'overview' | 'timeline' | 'weekly' | 'infractions' | 'protocol' | 'guide') => void;
  tachographData: FullTachographData | null;
  cardInserted: boolean;
  readerConnected: boolean;
  cardAtr?: string | null;
  onToggleCard: () => void;
  onInsertCard: () => void;
  onEjectCard: () => void;
  onClearData?: () => void;
  onOpenReaderModal: () => void;
  onOpenWatcherModal?: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tachographData,
  cardInserted,
  readerConnected,
  cardAtr = null,
  onToggleCard,
  onInsertCard,
  onEjectCard,
  onClearData,
  onOpenReaderModal,
  onOpenWatcherModal,
  mobileMenuOpen = false,
  setMobileMenuOpen
}) => {
  const infractionsCount = tachographData?.allInfractions?.length || 0;
  const driver = tachographData?.driver;

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Přehled aktivit',
      icon: Activity,
      badge: null
    },
    {
      id: 'timeline' as const,
      label: 'Denní časová osa',
      icon: Clock,
      badge: null
    },
    {
      id: 'weekly' as const,
      label: 'Týdenní souhrny (56h/90h)',
      icon: Calendar,
      badge: null
    },
    {
      id: 'infractions' as const,
      label: 'Analýza legislativy',
      icon: AlertTriangle,
      badge: infractionsCount > 0 ? infractionsCount : null
    },
    {
      id: 'protocol' as const,
      label: 'Kontrolní protokol',
      icon: FileText,
      badge: null
    },
    {
      id: 'guide' as const,
      label: 'Průvodce EU 561/2006',
      icon: BookOpen,
      badge: null
    }
  ];

  return (
    <>
      {/* Desktop Sidebar (w-64, bg-slate-900) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 min-h-screen border-r border-slate-800 no-print select-none">
        
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/30">
              T
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight block leading-none">
                TachoGuard
              </span>
              <span className="text-[11px] font-semibold text-indigo-400 tracking-wider uppercase">
                Pro Analýza
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Moduly kontroly
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`tab-${item.id}`}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Reader & Card Hardware Status in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
          
          {/* Header row with hardware badge */}
          <div className="flex items-center justify-between text-xs uppercase font-bold text-slate-400">
            <button
              onClick={onOpenWatcherModal}
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
              title="Otevřít automatický hlídač karty ve čtečce"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Stav slotu čtečky</span>
            </button>
            
            {/* Live Status Badge */}
            <button
              onClick={onToggleCard}
              className="cursor-pointer"
              title="Klikněte pro přepnutí stavu vložení / vyjmutí"
            >
              {cardInserted ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700 text-emerald-300 flex items-center gap-1 hover:bg-emerald-900 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  VLOŽENA
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/90 border border-amber-700 text-amber-300 flex items-center gap-1 hover:bg-amber-900 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  VYJMUTA
                </span>
              )}
            </button>
          </div>

          {/* Interactive Card/Slot State Box */}
          {driver ? (
            <div className="space-y-2.5">
              {/* Loaded driver card info */}
              <div className={`p-2.5 rounded-lg border transition-all ${
                cardInserted 
                  ? 'bg-slate-850 border-slate-750' 
                  : 'bg-amber-950/20 border-amber-900/40'
              }`}>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      cardInserted ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <div className="truncate">
                      <span className="text-white font-bold block truncate text-xs">
                        {driver.driverSurname} {driver.driverFirstNames}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {driver.cardNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1.5 mt-1.5 border-t border-slate-800">
                  <span className="text-slate-500">Čip: {cardInserted ? 'Aktivní kontakt' : 'Vytažen ze slotu'}</span>
                  <span className={cardInserted ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                    {cardInserted ? 'Čtečka online' : 'Offline náhled'}
                  </span>
                </div>
              </div>

              {/* Slot Presence Control Buttons */}
              <div className="flex gap-1.5">
                {cardInserted ? (
                  <button
                    onClick={onEjectCard}
                    id="btn-sidebar-eject-card"
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    title="Vysunout kartu ze čtečky (přepnout do stavu vyjmuto)"
                  >
                    <PowerOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vyjmout kartu</span>
                  </button>
                ) : (
                  <button
                    onClick={onInsertCard}
                    id="btn-sidebar-insert-card"
                    className="flex-1 py-1.5 px-2 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-700/60"
                    title="Potvrdit vložení karty do čtečky"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vložit kartu</span>
                  </button>
                )}

                <button
                  onClick={onOpenReaderModal}
                  title="Nové čtení nebo změna karty"
                  className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                >
                  <Usb className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Změnit</span>
                </button>

                {onClearData && (
                  <button
                    onClick={onClearData}
                    className="py-1.5 px-2 rounded bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs flex items-center justify-center transition-colors cursor-pointer"
                    title="Vymazat data a resetovat zobrazení"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 space-y-2.5">
              {cardInserted ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping inline-block" />
                      Karta zasunuta ve slotu
                    </span>
                    <button 
                      onClick={onEjectCard}
                      className="text-[10px] text-slate-400 hover:text-amber-300 underline cursor-pointer"
                      title="Klikněte pro simulaci vyjmutí karty ze čtečky"
                    >
                      Vyjmout
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Čtečka USB je připravena. Spusťte čtení kliknutím níže.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />
                      Slot je prázdný
                    </span>
                    <button 
                      onClick={onInsertCard}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                    >
                      Zasunout kartu
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Karta byla vyjmuta. Zasuňte čipovou kartu do čtečky.
                  </p>
                </div>
              )}

              <button
                onClick={onOpenReaderModal}
                id="btn-sidebar-read-card"
                className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-98 ${
                  cardInserted 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{cardInserted ? 'Spustit čtení karty' : 'Otevřít čtečku karet'}</span>
              </button>
            </div>
          )}

        </div>
      </aside>

      {/* Mobile Top Navbar (Visible only on < lg screens) */}
      <div className="lg:hidden bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight block leading-tight">
                TachoGuard Pro
              </span>
              {driver ? (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full inline-block ${cardInserted ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-slate-200 block truncate max-w-[130px] font-medium">
                    {driver.driverSurname}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({cardInserted ? 'Vložena' : 'Vyjmuta'})
                  </span>
                </div>
              ) : (
                <span className={`text-[11px] block truncate font-medium ${cardInserted ? 'text-emerald-400' : 'text-amber-300'}`}>
                  ● {cardInserted ? 'Karta vložena ve čtečce' : 'Slot je prázdný'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCard}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 border ${
                cardInserted
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              }`}
              title="Přepnout stav vložení/vyjmutí karty"
            >
              <span>{cardInserted ? 'Vyjmout' : 'Vložit'}</span>
            </button>
            <button
              onClick={onOpenReaderModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>{driver ? 'Změnit' : 'Načíst'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Tabs or Expanded Menu */}
        {mobileMenuOpen ? (
          <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-900 animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen && setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="px-2 py-0.5 text-xs rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
};
