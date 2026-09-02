import { DriverCardInfo, DaySummary, ActivitySegment, FullTachographData } from '../types/tachograph';
import { processRawDays, buildFullTachographData } from './legislationEngine';

// Helper to build sequential timeline activities without overlapping timestamps or fixed repetitive templates
function buildDayFromBlocks(
  dateStr: string,
  blocks: { duration: number; type: 'REST' | 'WORK' | 'DRIVING' | 'AVAILABILITY'; cardStatus?: 'INSERTED' | 'NOT_INSERTED' }[],
  vrn: string = '1AB 8492'
): ActivitySegment[] {
  let currentMinute = 0;
  const segments: ActivitySegment[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const h = Math.floor(currentMinute / 60);
    const m = currentMinute % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    segments.push({
      id: `act_${dateStr}_${i}`,
      timestamp: `${dateStr}T${timeStr}:00Z`,
      dateStr,
      timeStr,
      durationMinutes: b.duration,
      activity: b.type,
      slot: 'DRIVER_1',
      cardStatus: b.cardStatus || (b.type === 'REST' && currentMinute === 0 && b.duration >= 300 ? 'NOT_INSERTED' : 'INSERTED'),
      vehicleRegistration: vrn
    });

    currentMinute += b.duration;
  }

  // If blocks don't sum up to 1440 minutes, fill remainder with REST
  if (currentMinute < 1440) {
    const dur = 1440 - currentMinute;
    const h = Math.floor(currentMinute / 60);
    const m = currentMinute % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    segments.push({
      id: `act_${dateStr}_rest_end`,
      timestamp: `${dateStr}T${timeStr}:00Z`,
      dateStr,
      timeStr,
      durationMinutes: dur,
      activity: 'REST',
      slot: 'DRIVER_1',
      cardStatus: 'INSERTED',
      vehicleRegistration: vrn
    });
  }

  return segments;
}

// Generate 28-day dataset for Jan Novák
function generateJanNovakDays(): DaySummary[] {
  const rawDays = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 27); // 28 days back

  for (let d = 0; d < 28; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayOfWeek = curDate.getDay(); // 0 is Sun, 6 is Sat

    const vrn = d % 14 > 7 ? '7AM 3301' : '1AB 8492';
    const odoBase = 450000 + d * 620;

    // Days 25, 26, 27 are recent non-driving rest days (31.8., 1.9., 2.9.) or weekend
    if (dayOfWeek === 0 || dayOfWeek === 6 || d >= 25) {
      // Weekend / Rest / Off-duty day - 100% clean, 0 driving, 0 infractions
      const activities: ActivitySegment[] = [
        {
          id: `act_${dateStr}_0`,
          timestamp: `${dateStr}T00:00:00Z`,
          dateStr,
          timeStr: '00:00',
          durationMinutes: 1440,
          activity: 'REST',
          slot: 'DRIVER_1',
          cardStatus: 'NOT_INSERTED',
          vehicleRegistration: ''
        }
      ];

      rawDays.push({
        dateStr,
        activities,
        vehicles: [],
        places: []
      });
    } else if (d === 11) {
      // INFRACTION DAY 1: Continuous drive exceeded (4h 44m continuous driving before parking)
      const acts = buildDayFromBlocks(dateStr, [
        { duration: 360, type: 'REST' }, // 6h rest till 06:00
        { duration: 25, type: 'WORK' }, // Pre-trip check 06:00-06:25
        { duration: 284, type: 'DRIVING' }, // 4h 44m CONTINUOUS DRIVE! (Exceeds 4h30m by 14 min) 06:25-11:09
        { duration: 55, type: 'REST' }, // 55m break 11:09-12:04
        { duration: 220, type: 'DRIVING' }, // 3h 40m drive 12:04-15:44
        { duration: 30, type: 'WORK' }, // Unloading 15:44-16:14
        { duration: 466, type: 'REST' } // Daily rest 16:14-24:00
      ], vrn);

      rawDays.push({
        dateStr,
        activities: acts,
        vehicles: [{ registration: vrn, startKm: odoBase, endKm: odoBase + 610 }],
        places: [
          { type: 'ENTRY' as const, country: 'CZ', timestamp: `${dateStr}T06:00:00Z`, odometer: odoBase },
          { type: 'EXIT' as const, country: 'DE', timestamp: `${dateStr}T09:15:00Z`, odometer: odoBase + 280 }
        ]
      });
    } else if (d === 18) {
      // INFRACTION DAY 2: Insufficient daily rest (8h 46m instead of min 9h)
      const acts = buildDayFromBlocks(dateStr, [
        { duration: 420, type: 'REST' }, // Rest till 07:00
        { duration: 20, type: 'WORK' }, // 07:00-07:20
        { duration: 240, type: 'DRIVING' }, // 4h drive 07:20-11:20
        { duration: 50, type: 'REST' }, // 50m break 11:20-12:10
        { duration: 260, type: 'DRIVING' }, // 4h 20m drive (total 8h 20m) 12:10-16:30
        { duration: 45, type: 'WORK' }, // 16:30-17:15
        { duration: 15, type: 'AVAILABILITY' }, // 17:15-17:30
        { duration: 390, type: 'REST' } // Rest started at 17:30 (8h 46m within 24h cycle)
      ], vrn);

      rawDays.push({
        dateStr,
        activities: acts,
        vehicles: [{ registration: vrn, startKm: odoBase, endKm: odoBase + 645 }],
        places: [
          { type: 'ENTRY' as const, country: 'DE', timestamp: `${dateStr}T07:00:00Z`, odometer: odoBase },
          { type: 'EXIT' as const, country: 'NL', timestamp: `${dateStr}T14:30:00Z`, odometer: odoBase + 490 }
        ]
      });
    } else {
      // Unique and varied daily profiles for each day of the week
      let acts: ActivitySegment[] = [];
      let kmDriven = 520;

      if (dayOfWeek === 1) {
        // Monday: Early departure & route start
        acts = buildDayFromBlocks(dateStr, [
          { duration: 330, type: 'REST' }, // rest till 05:30
          { duration: 20, type: 'WORK' }, // 05:30-05:50 vehicle prep
          { duration: 225, type: 'DRIVING' }, // 3h 45m drive (05:50-09:35)
          { duration: 45, type: 'REST' }, // 45m break (09:35-10:20)
          { duration: 190, type: 'DRIVING' }, // 3h 10m drive (10:20-13:30)
          { duration: 40, type: 'WORK' }, // 40m client unloading (13:30-14:10)
          { duration: 55, type: 'DRIVING' }, // 55m relocation (14:10-15:05)
          { duration: 15, type: 'WORK' }, // 15m parking & lock (15:05-15:20)
          { duration: 520, type: 'REST' } // overnight rest (15:20-24:00)
        ], vrn);
        kmDriven = 580;
      } else if (dayOfWeek === 2) {
        // Tuesday: 3 driving blocks (3h 30m, 1h 15m, 3h 35m) with compliant 45m breaks (Total 8h 20m drive)
        acts = buildDayFromBlocks(dateStr, [
          { duration: 400, type: 'REST' }, // rest till 06:40
          { duration: 25, type: 'WORK' }, // 06:40-07:05 vehicle prep
          { duration: 210, type: 'DRIVING' }, // 3h 30m drive (07:05-10:35)
          { duration: 45, type: 'REST' }, // 45m mandatory break (10:35-11:20) -> full reset
          { duration: 75, type: 'DRIVING' }, // 1h 15m drive (11:20-12:35)
          { duration: 45, type: 'REST' }, // 45m break (12:35-13:20) -> full reset
          { duration: 215, type: 'DRIVING' }, // 3h 35m drive (13:20-16:55)
          { duration: 25, type: 'WORK' }, // 25m unload (16:55-17:20)
          { duration: 400, type: 'REST' } // rest (17:20-24:00)
        ], vrn);
        kmDriven = 610;
      } else if (dayOfWeek === 3) {
        // Wednesday: Distribution & logistics with availability periods
        acts = buildDayFromBlocks(dateStr, [
          { duration: 435, type: 'REST' }, // rest till 07:15
          { duration: 15, type: 'WORK' }, // 07:15-07:30
          { duration: 180, type: 'DRIVING' }, // 3h 00m drive (07:30-10:30)
          { duration: 50, type: 'WORK' }, // 50m complex loading (10:30-11:20)
          { duration: 45, type: 'REST' }, // 45m full break (11:20-12:05)
          { duration: 195, type: 'DRIVING' }, // 3h 15m drive (12:05-15:20)
          { duration: 25, type: 'AVAILABILITY' }, // 25m customs/gate wait (15:20-15:45)
          { duration: 45, type: 'DRIVING' }, // 45m drive to parking (15:45-16:30)
          { duration: 450, type: 'REST' } // rest (16:30-24:00)
        ], vrn);
        kmDriven = 490;
      } else if (dayOfWeek === 4) {
        // Thursday: Long haul highway run (fully compliant with 2x 45m breaks)
        acts = buildDayFromBlocks(dateStr, [
          { duration: 310, type: 'REST' }, // rest till 05:10
          { duration: 20, type: 'WORK' }, // 05:10-05:30 vehicle check
          { duration: 235, type: 'DRIVING' }, // 3h 55m drive (05:30-09:25)
          { duration: 50, type: 'REST' }, // 50m break (09:25-10:15)
          { duration: 205, type: 'DRIVING' }, // 3h 25m drive (10:15-13:40)
          { duration: 35, type: 'WORK' }, // 35m client stop (13:40-14:15)
          { duration: 45, type: 'REST' }, // 45m mandatory break (14:15-15:00)
          { duration: 110, type: 'DRIVING' }, // 1h 50m return drive (15:00-16:50)
          { duration: 20, type: 'WORK' }, // 20m fueling (16:50-17:10)
          { duration: 410, type: 'REST' } // rest (17:10-24:00)
        ], vrn);
        kmDriven = 640;
      } else {
        // Friday: Return to base & pre-weekend rest
        acts = buildDayFromBlocks(dateStr, [
          { duration: 375, type: 'REST' }, // rest till 06:15
          { duration: 25, type: 'WORK' }, // 06:15-06:40
          { duration: 195, type: 'DRIVING' }, // 3h 15m drive (06:40-09:55)
          { duration: 45, type: 'REST' }, // 45m break (09:55-10:40)
          { duration: 160, type: 'DRIVING' }, // 2h 40m return (10:40-13:20)
          { duration: 40, type: 'WORK' }, // 40m base handover & wash (13:20-14:00)
          { duration: 600, type: 'REST' } // Weekly rest starts 14:00 (14:00-24:00)
        ], vrn);
        kmDriven = 420;
      }

      rawDays.push({
        dateStr,
        activities: acts,
        vehicles: [{ registration: vrn, startKm: odoBase, endKm: odoBase + kmDriven }],
        places: [
          { type: 'ENTRY' as const, country: 'CZ', timestamp: `${dateStr}T06:00:00Z`, odometer: odoBase }
        ]
      });
    }
  }

  return processRawDays(rawDays);
}

// Generate Petr Svoboda (100% clean profile)
function generatePetrSvobodaDays(): DaySummary[] {
  const rawDays = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 27);

  for (let d = 0; d < 28; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayOfWeek = curDate.getDay();
    const vrn = '2SN 4819';
    const odoBase = 185000 + d * 340;

    if (dayOfWeek === 0 || dayOfWeek === 6 || d >= 25) {
      // Weekend / Rest day (including recent days 31.8., 1.9., 2.9.)
      rawDays.push({
        dateStr,
        activities: [
          {
            id: `act_${dateStr}_0`,
            timestamp: `${dateStr}T00:00:00Z`,
            dateStr,
            timeStr: '00:00',
            durationMinutes: 1440,
            activity: 'REST' as const,
            slot: 'DRIVER_1' as const,
            cardStatus: 'NOT_INSERTED' as const,
            vehicleRegistration: ''
          }
        ],
        vehicles: []
      });
    } else {
      // Urban split breaks: 15 min break early + 30 min break later
      const is10hDay = (dayOfWeek === 2 || dayOfWeek === 4); // Tuesday & Thursday 10h drive (allowed max 2x)
      const acts = buildDayFromBlocks(dateStr, [
        { duration: 360, type: 'REST' }, // rest till 06:00
        { duration: 30, type: 'WORK' }, // 06:00-06:30 load
        { duration: 110, type: 'DRIVING' }, // 1h 50m (06:30-08:20)
        { duration: 18, type: 'REST' }, // 18m SPLIT PART 1 (08:20-08:38, >= 15m)
        { duration: 130, type: 'DRIVING' }, // 2h 10m (08:38-10:48)
        { duration: 35, type: 'REST' }, // 35m SPLIT PART 2 (10:48-11:23, >= 30m) -> RESET!
        { duration: 120, type: 'DRIVING' }, // 2h 00m (11:23-13:23)
        { duration: 40, type: 'WORK' }, // 13:23-14:03
        { duration: is10hDay ? 220 : 140, type: 'DRIVING' }, // extra drive on allowed days (14:03-17:43)
        { duration: 377, type: 'REST' }
      ], vrn);

      rawDays.push({
        dateStr,
        activities: acts,
        vehicles: [{ registration: vrn, startKm: odoBase, endKm: odoBase + (is10hDay ? 460 : 310) }],
        places: [
          { type: 'ENTRY' as const, country: 'CZ', timestamp: `${dateStr}T06:00:00Z`, odometer: odoBase }
        ]
      });
    }
  }

  return processRawDays(rawDays);
}

// Generate Martin Kovář (High risk profile with multiple violations)
function generateMartinKovarDays(): DaySummary[] {
  const rawDays = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 27);

  for (let d = 0; d < 28; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayOfWeek = curDate.getDay();
    const vrn = '5H8 9912';
    const odoBase = 720000 + d * 710;

    if (dayOfWeek === 0) {
      rawDays.push({
        dateStr,
        activities: [
          {
            id: `act_${dateStr}_0`,
            timestamp: `${dateStr}T00:00:00Z`,
            dateStr,
            timeStr: '00:00',
            durationMinutes: 1440,
            activity: 'REST' as const,
            slot: 'DRIVER_1' as const,
            cardStatus: 'NOT_INSERTED' as const,
            vehicleRegistration: vrn
          }
        ],
        vehicles: []
      });
    } else {
      // Heavy driving on all days -> 3rd 10h drive and high weekly total
      const driveMin1 = d === 15 ? 315 : 260; // 5h 15m continuous drive on day 15!
      const driveMin2 = 320; // 5h 20m drive (Total 9h 40m - 10h 35m)

      const acts = buildDayFromBlocks(dateStr, [
        { duration: 330, type: 'REST' }, // 5.5h rest (insufficient!) 00:00-05:30
        { duration: 25, type: 'WORK' }, // 05:30-05:55
        { duration: driveMin1, type: 'DRIVING' }, // 05:55-...
        { duration: 30, type: 'REST' }, // 30m break (insufficient for full reset)
        { duration: driveMin2, type: 'DRIVING' },
        { duration: 35, type: 'WORK' },
        { duration: 385, type: 'REST' }
      ], vrn);

      rawDays.push({
        dateStr,
        activities: acts,
        vehicles: [{ registration: vrn, startKm: odoBase, endKm: odoBase + 690 }],
        places: [
          { type: 'ENTRY' as const, country: 'CZ', timestamp: `${dateStr}T05:30:00Z`, odometer: odoBase },
          { type: 'EXIT' as const, country: 'PL', timestamp: `${dateStr}T10:00:00Z`, odometer: odoBase + 340 }
        ]
      });
    }
  }

  return processRawDays(rawDays);
}

export const SAMPLE_DRIVER_CARDS: {
  id: string;
  name: string;
  badge: string;
  description: string;
  driverInfo: DriverCardInfo;
  getData: () => FullTachographData;
}[] = [
  {
    id: 'jan_novak',
    name: 'Jan Novák (MKD – Mezinárodní kamion)',
    badge: 'Reálný provoz (2 drobné přestupky)',
    description: 'Trasy CZ – DE – NL. Typický měsíc řidiče kamionu se dvěma drobnými přestupky (1x jízda 4h 44m v zácpě, 1x zkrácený odpočinek 8h 46m).',
    driverInfo: {
      cardNumber: 'CZ-00000492819001',
      driverSurname: 'NOVÁK',
      driverFirstNames: 'Jan',
      birthDate: '1979-05-14',
      issuingState: 'CZ (Česká republika)',
      issuingAuthority: 'Magistrát hl. m. Prahy',
      cardExpiryDate: '2028-11-20',
      cardIssueDate: '2023-11-21',
      drivingLicenseNumber: 'EA 981240',
      generation: 'Gen 2 (Smart Tachograf v1/v2)',
      cardStructureVersion: '0002 / ISO 7816-4',
      readTimestamp: new Date().toISOString(),
      fileSource: 'SAMPLE_PROFILE',
      fileName: 'C_CZ00000492819001_20260901.DDD'
    },
    getData: () => {
      const driver: DriverCardInfo = {
        cardNumber: 'CZ-00000492819001',
        driverSurname: 'NOVÁK',
        driverFirstNames: 'Jan',
        birthDate: '1979-05-14',
        issuingState: 'CZ (Česká republika)',
        issuingAuthority: 'Magistrát hl. m. Prahy',
        cardExpiryDate: '2028-11-20',
        cardIssueDate: '2023-11-21',
        drivingLicenseNumber: 'EA 981240',
        generation: 'Gen 2 (Smart Tachograf v1/v2)',
        cardStructureVersion: '0002 / ISO 7816-4',
        readTimestamp: new Date().toISOString(),
        fileSource: 'SAMPLE_PROFILE',
        fileName: 'C_CZ00000492819001_20260901.DDD'
      };
      return buildFullTachographData(driver, generateJanNovakDays());
    }
  },
  {
    id: 'petr_svoboda',
    name: 'Petr Svoboda (Vnitrostátní rozvoz ADR / Solo)',
    badge: '100% v souladu s legislativou',
    description: 'Vnitrostátní distribuce, dělené přestávky 15 + 30 min, 2x 10h řízení v týdnu, vzorové dodržování bez jakékoliv pokuty.',
    driverInfo: {
      cardNumber: 'CZ-00000783102002',
      driverSurname: 'SVOBODA',
      driverFirstNames: 'Petr',
      birthDate: '1984-09-22',
      issuingState: 'CZ (Česká republika)',
      issuingAuthority: 'MěÚ Mladá Boleslav',
      cardExpiryDate: '2029-03-15',
      cardIssueDate: '2024-03-16',
      drivingLicenseNumber: 'FC 319082',
      generation: 'Gen 2 (Smart Tachograf v1/v2)',
      cardStructureVersion: '0002 / ISO 7816-4',
      readTimestamp: new Date().toISOString(),
      fileSource: 'SAMPLE_PROFILE',
      fileName: 'C_CZ00000783102002_20260901.DDD'
    },
    getData: () => {
      const driver: DriverCardInfo = {
        cardNumber: 'CZ-00000783102002',
        driverSurname: 'SVOBODA',
        driverFirstNames: 'Petr',
        birthDate: '1984-09-22',
        issuingState: 'CZ (Česká republika)',
        issuingAuthority: 'MěÚ Mladá Boleslav',
        cardExpiryDate: '2029-03-15',
        cardIssueDate: '2024-03-16',
        drivingLicenseNumber: 'FC 319082',
        generation: 'Gen 2 (Smart Tachograf v1/v2)',
        cardStructureVersion: '0002 / ISO 7816-4',
        readTimestamp: new Date().toISOString(),
        fileSource: 'SAMPLE_PROFILE',
        fileName: 'C_CZ00000783102002_20260901.DDD'
      };
      return buildFullTachographData(driver, generatePetrSvobodaDays());
    }
  },
  {
    id: 'martin_kovar',
    name: 'Martin Kovář (Testovací profil s přestupky)',
    badge: 'Vysoké riziko pokuty (Ukázka protokolu)',
    description: 'Demonstrace závažných přestupků: 3x 10h jízda v týdnu, překročení 90h za 2 týdny a nedostatečný odpočinek pro kontrolu CSPSD.',
    driverInfo: {
      cardNumber: 'CZ-00000219488001',
      driverSurname: 'KOVÁŘ',
      driverFirstNames: 'Martin',
      birthDate: '1975-12-03',
      issuingState: 'CZ (Česká republika)',
      issuingAuthority: 'MěÚ Hradec Králové',
      cardExpiryDate: '2027-08-10',
      cardIssueDate: '2022-08-11',
      drivingLicenseNumber: 'DB 672109',
      generation: 'Gen 1 (Digitální)',
      cardStructureVersion: '0001 / ISO 7816-4',
      readTimestamp: new Date().toISOString(),
      fileSource: 'SAMPLE_PROFILE',
      fileName: 'C_CZ00000219488001_20260901.DDD'
    },
    getData: () => {
      const driver: DriverCardInfo = {
        cardNumber: 'CZ-00000219488001',
        driverSurname: 'KOVÁŘ',
        driverFirstNames: 'Martin',
        birthDate: '1975-12-03',
        issuingState: 'CZ (Česká republika)',
        issuingAuthority: 'MěÚ Hradec Králové',
        cardExpiryDate: '2027-08-10',
        cardIssueDate: '2022-08-11',
        drivingLicenseNumber: 'DB 672109',
        generation: 'Gen 1 (Digitální)',
        cardStructureVersion: '0001 / ISO 7816-4',
        readTimestamp: new Date().toISOString(),
        fileSource: 'SAMPLE_PROFILE',
        fileName: 'C_CZ00000219488001_20260901.DDD'
      };
      return buildFullTachographData(driver, generateMartinKovarDays());
    }
  }
];
