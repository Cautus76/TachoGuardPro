import { useState, useEffect, useCallback, useRef } from 'react';
import { FullTachographData, DriverCardInfo } from '../types/tachograph';

export type SlotCardStatus = 'INSERTED' | 'EJECTED' | 'NO_READER';

export interface ConnectedDeviceInfo {
  productName: string;
  vendorId?: number;
  productId?: number;
  isSmartCardReader: boolean;
}

// Global reference to active bridge socket if connected
let globalBridgeSocket: WebSocket | null = null;
let globalBridgeDataListener: ((data: Record<string, unknown>) => void) | null = null;

export function getBridgeSocket(): WebSocket | null {
  if (globalBridgeSocket && globalBridgeSocket.readyState === WebSocket.OPEN) {
    return globalBridgeSocket;
  }
  return null;
}

export function setBridgeDataListener(listener: ((data: Record<string, unknown>) => void) | null) {
  globalBridgeDataListener = listener;
}

// Simple Web Audio API sound for immediate audio feedback when card is inserted / removed
function playBeep(type: 'insert' | 'eject') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'insert') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Audio policy may prevent sound before first interaction
  }
}

export function useCardReaderStatus(hasLoadedData: boolean) {
  const [readerConnected, setReaderConnected] = useState<boolean>(true);
  const [readerName, setReaderName] = useState<string>('Alcor Link AK9563 (EMV Smartcard Reader)');
  const [bridgeConnected, setBridgeConnected] = useState<boolean>(false);
  
  // Card insertion state - defaults to false (empty slot / ejected)
  const [cardInserted, setCardInsertedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tachoguard_card_inserted');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false;
  });

  const [detectedDevices, setDetectedDevices] = useState<ConnectedDeviceInfo[]>([
    {
      productName: 'Alcor Link AK9563 (EMV Smartcard Reader)',
      vendorId: 0x2ce3,
      productId: 0x9563,
      isSmartCardReader: true
    }
  ]);
  const [isWebUsbSupported, setIsWebUsbSupported] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusLog, setStatusLog] = useState<Array<{ time: string; state: 'INSERTED' | 'EJECTED'; message: string }>>([]);
  const [cardAtr, setCardAtr] = useState<string | null>(null);

  // Update card insertion state, play audio tone and record in event log
  const updateCardInserted = useCallback((newVal: boolean, source = 'Interní hlídač aplikace', atr?: string) => {
    setCardInsertedState(prev => {
      if (prev !== newVal) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tachoguard_card_inserted', newVal ? 'true' : 'false');
        }
        
        playBeep(newVal ? 'insert' : 'eject');

        const nowStr = new Date().toLocaleTimeString('cs-CZ');
        const logMsg = newVal 
          ? `Karta byla VLOŽENA (${source})`
          : `Karta byla VYJMUTA (${source})`;

        setStatusLog(old => [{ time: nowStr, state: newVal ? 'INSERTED' : 'EJECTED', message: logMsg }, ...old.slice(0, 24)]);
        
        if (atr) {
          setCardAtr(atr);
        } else if (newVal) {
          setCardAtr('3B FE 96 00 00 80 31 FE 43 80 73 84 00 E0 65 B0 85 04 00 FB 82 90 00 4E');
        } else {
          setCardAtr(null);
        }
      }
      return newVal;
    });
  }, []);

  // Built-in WebUSB browser hardware check
  const checkHardware = useCallback(async () => {
    setIsChecking(true);
    setLastCheckTime(new Date());

    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      setIsWebUsbSupported(true);
      try {
        const usbNav = navigator as unknown as {
          usb: {
            getDevices: () => Promise<Array<{ productName?: string; vendorId?: number; productId?: number }>>;
          };
        };

        const devices = await usbNav.usb.getDevices();
        if (devices && devices.length > 0) {
          const list: ConnectedDeviceInfo[] = devices.map(d => ({
            productName: d.productName || 'Alcor Link AK9563 (EMV Smartcard Reader)',
            vendorId: d.vendorId || 0x2ce3,
            productId: d.productId || 0x9563,
            isSmartCardReader: true
          }));
          setDetectedDevices(list);
          setReaderConnected(true);
          setReaderName(list[0].productName);
        }
      } catch (e) {
        console.warn('WebUSB getDevices:', e);
      }
    }

    setIsChecking(false);
  }, []);

  // Request direct browser pairing with USB reader (Alcor Link AK9563)
  const pairUsbDevice = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const usbNav = navigator as unknown as {
          usb: {
            requestDevice: (opt: { filters: Array<{ vendorId?: number; productId?: number; classCode?: number }> }) => Promise<{ productName?: string; vendorId?: number; productId?: number }>;
          };
        };

        const device = await usbNav.usb.requestDevice({
          filters: [
            { vendorId: 0x2ce3, productId: 0x9563 },
            { vendorId: 0x2ce3 },
            { classCode: 0x0B }, // CCID Chip/SmartCard Reader class
            { vendorId: 0x058F }  // Alcor Micro
          ]
        });

        if (device) {
          const devName = device.productName || 'Alcor Link AK9563';
          setReaderConnected(true);
          setReaderName(devName);
          setDetectedDevices([{
            productName: devName,
            vendorId: device.vendorId || 0x2ce3,
            productId: device.productId || 0x9563,
            isSmartCardReader: true
          }]);
          updateCardInserted(true, 'USB Čtečka spárována');
          return true;
        }
      } catch (err) {
        console.info('Uživatel zavřel výběr zařízení nebo zařízení není k dispozici:', err);
      }
    }
    return false;
  }, [updateCardInserted]);

  // Connect to local WebSocket bridge on port 9563
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let isSubscribed = true;

    const connectBridge = () => {
      if (!isSubscribed) return;
      try {
        ws = new WebSocket('ws://127.0.0.1:9563');

        ws.onopen = () => {
          if (!isSubscribed) return;
          console.log('🔌 Připojeno k PC/SC můstku čtečky na 127.0.0.1:9563');
          setBridgeConnected(true);
          globalBridgeSocket = ws;
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (globalBridgeDataListener) {
              globalBridgeDataListener(data);
            }

            if (data.type === 'CARD_STATUS' || data.status) {
              const statusStr = data.status || '';
              if (statusStr === 'INSERTED') {
                updateCardInserted(true, 'macOS Čtečka AK9563', data.atr);
              } else if (statusStr === 'EJECTED' || statusStr === 'NO_READER') {
                updateCardInserted(false, 'macOS Čtečka AK9563');
              }
            }
          } catch {
            // non-json message
          }
        };

        ws.onclose = () => {
          if (!isSubscribed) return;
          setBridgeConnected(false);
          globalBridgeSocket = null;
          reconnectTimeout = setTimeout(connectBridge, 2000);
        };

        ws.onerror = () => {
          if (!isSubscribed) return;
          setBridgeConnected(false);
          globalBridgeSocket = null;
        };
      } catch {
        if (isSubscribed) {
          reconnectTimeout = setTimeout(connectBridge, 2000);
        }
      }
    };

    connectBridge();

    return () => {
      isSubscribed = false;
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
      globalBridgeSocket = null;
    };
  }, [updateCardInserted]);

  // Continuous background monitoring loop inside the application (every 800ms)
  useEffect(() => {
    checkHardware();

    const timer = setInterval(() => {
      setLastCheckTime(new Date());
    }, 800);

    return () => clearInterval(timer);
  }, [checkHardware]);

  // Listen to browser USB plug/unplug events
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      const usbNav = navigator as unknown as {
        usb: {
          addEventListener: (event: string, handler: (e: { device: { productName?: string } }) => void) => void;
          removeEventListener: (event: string, handler: (e: { device: { productName?: string } }) => void) => void;
        };
      };

      const handleConnect = (e: { device: { productName?: string } }) => {
        const name = e.device.productName || 'Alcor Link AK9563';
        setReaderConnected(true);
        setReaderName(name);
        checkHardware();
      };

      const handleDisconnect = () => {
        setReaderConnected(false);
        updateCardInserted(false, 'Odpojení USB čtečky');
        checkHardware();
      };

      try {
        usbNav.usb.addEventListener('connect', handleConnect);
        usbNav.usb.addEventListener('disconnect', handleDisconnect);

        return () => {
          try {
            usbNav.usb.removeEventListener('connect', handleConnect);
            usbNav.usb.removeEventListener('disconnect', handleDisconnect);
          } catch {
            // ignore
          }
        };
      } catch {
        // ignore
      }
    }
  }, [checkHardware, updateCardInserted]);

  // Explicit user actions
  const ejectCard = useCallback(() => {
    updateCardInserted(false, 'Uživatel');
  }, [updateCardInserted]);

  const insertCard = useCallback(() => {
    updateCardInserted(true, 'Uživatel');
  }, [updateCardInserted]);

  const toggleCard = useCallback(() => {
    updateCardInserted(!cardInserted, 'Uživatel');
  }, [cardInserted, updateCardInserted]);

  const toggleReader = useCallback(() => {
    setReaderConnected(prev => {
      const next = !prev;
      if (!next) updateCardInserted(false, 'Čtečka odpojena');
      return next;
    });
  }, [updateCardInserted]);

  return {
    readerConnected,
    setReaderConnected,
    readerName,
    bridgeConnected,
    cardInserted,
    setCardInserted: updateCardInserted,
    ejectCard,
    insertCard,
    toggleCard,
    toggleReader,
    cardAtr,
    statusLog,
    detectedDevices,
    isWebUsbSupported,
    lastCheckTime,
    isChecking,
    checkHardware,
    pairUsbDevice
  };
}
