import { DriverCardInfo, DaySummary, ActivitySegment, FullTachographData } from '../types/tachograph';
import { processRawDays, buildFullTachographData } from './legislationEngine';

// Helper to generate a sequence of activities for a day
function generateDayActivities(
  dateStr: string,
  schedule: { time: string; duration: number; type: 'REST' | 'WORK' | 'DRIVING' | 'AVAILABILITY'; vrn?: string }[]
): ActivitySegment[] {
  return schedule.map((item, idx) => ({
    id: `act_${dateStr}_${idx}`,
    timestamp: `${dateStr}T${item.time}:00Z`,
    dateStr,
    timeStr: item.time,
    durationMinutes: item.duration,
    activity: item.type,
    slot: 'DRIVER_1',
    cardStatus: 'INSERTED',
    vehicleRegistration: item.vrn || '1AB 8492'
  }));
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

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend / Weekly rest
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
          vehicleRegistration: vrn
        }
      ];

      rawDays.push({
        dateStr,
        activities,
        vehicles: [],
        places: [
          { type: 'ENTRY' as const, country: 'CZ', timestamp: `${dateStr}T00:00:00Z`, odometer: odoBase }
        ]
      });
    } else if (d === 11) {
      // INFRACTION DAY 1: Continuous drive exceeded (4h 44m continuous driving before parking)
      const acts = generateDayActivities(dateStr, [
        { time: '00:00', duration: 360, type: 'REST', vrn }, // 6h rest till 06:00
        { time: '06:00', duration: 25, type: 'WORK', vrn }, // Pre-trip check
        { time: '06:25', duration: 284, type: 'DRIVING', vrn }, // 4h 44m CONTINUOUS DRIVE! (Exceeds 4h30m by 14 min)
        { time: '11:09', duration: 55, type: 'REST', vrn }, // 55m break
        { time: '12:04', duration: 220, type: 'DRIVING', vrn }, // 3h 40m drive
        { time: '15:44', duration: 30, type: 'WORK', vrn }, // Unloading
        { time: '16:14', duration: 466, type: 'REST', vrn } // Daily rest
      ]);

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
      const acts = generateDayActivities(dateStr, [
        { time: '00:00', duration: 420, type: 'REST', vrn }, // Rest till 07:00
        { time: '07:00', duration: 20, type: 'WORK', vrn },
        { time: '07:20', duration: 240, type: 'DRIVING', vrn }, // 4h drive
        { time: '11:20', duration: 50, type: 'REST', vrn }, // 50m break
        { time: '12:10', duration: 260, type: 'DRIVING', vrn }, // 4h 20m drive (total 8h 20m)
        { time: '16:30', duration: 45, type: 'WORK', vrn },
        { time: '17:15', duration: 15, type: 'AVAILABILITY', vrn },
        { time: '17:30', duration: 390, type: 'REST', vrn } // Rest started at 17:30
      ]);

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
      // Normal compliant day (e.g. 8h 15m driving, 45m break, 11h rest)
      const drivePart1 = 210 + (d % 3) * 15; // 3h 30m - 4h
      const drivePart2 = 200 + (d % 4) * 10; // 3h 20m - 3h 50m

      const acts = generateDayActivities(dateStr, [
        { time: '00:00', duration: 390, type: 'REST', vrn }, // rest till 06:30
        { time: '06:30', duration: 20, type: 'WORK', vrn }, // inspection
        { time: '06:50', duration: drivePart1, type: 'DRIVING', vrn }, // ~3.5h drive
        { time: '10:30', duration: 48, type: 'REST', vrn }, // 48m break
        { time: '11:18', duration: drivePart2, type: 'DRIVING', vrn }, // ~3.5h drive
        { time: '15:00', duration: 35, type: 'WORK', vrn }, // unload
        { time: '15:35', duration: 505, type: 'REST', vrn } // overnight rest
      ]);

      rawDays.push({
        dateStr,
        activities: acts,
        vehicles: [{ registration: vrn, startKm: odoBase, endKm: odoBase + 580 }],
        places: [
          { type: 'ENTRY' as const, country: 'CZ', timestamp: `${dateStr}T06:30:00Z`, odometer: odoBase }
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

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend rest
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
      // Urban split breaks: 15 min break early + 30 min break later
      const is10hDay = (dayOfWeek === 2 || dayOfWeek === 4); // Tuesday & Thursday 10h drive (allowed max 2x)
      const acts = generateDayActivities(dateStr, [
        { time: '00:00', duration: 360, type: 'REST', vrn }, // rest till 06:00
        { time: '06:00', duration: 30, type: 'WORK', vrn }, // load
        { time: '06:30', duration: 110, type: 'DRIVING', vrn }, // 1h 50m
        { time: '08:20', duration: 18, type: 'REST', vrn }, // 18m SPLIT PART 1 (>= 15m)
        { time: '08:38', duration: 130, type: 'DRIVING', vrn }, // 2h 10m
        { time: '10:48', duration: 35, type: 'REST', vrn }, // 35m SPLIT PART 2 (>= 30m) -> RESET!
        { time: '11:23', duration: 120, type: 'DRIVING', vrn }, // 2h
        { time: '13:23', duration: 40, type: 'WORK', vrn },
        { time: '14:03', duration: is10hDay ? 220 : 140, type: 'DRIVING', vrn }, // extra drive on allowed days
        { time: '17:43', duration: 377, type: 'REST', vrn }
      ]);

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

      const acts = generateDayActivities(dateStr, [
        { time: '00:00', duration: 330, type: 'REST', vrn }, // 5.5h rest (insufficient!)
        { time: '05:30', duration: 25, type: 'WORK', vrn },
        { time: '05:55', duration: driveMin1, type: 'DRIVING', vrn },
        { time: '11:10', duration: 30, type: 'REST', vrn }, // 30m break (insufficient for full reset)
        { time: '11:40', duration: driveMin2, type: 'DRIVING', vrn },
        { time: '17:00', duration: 35, type: 'WORK', vrn },
        { time: '17:35', duration: 385, type: 'REST', vrn }
      ]);

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
