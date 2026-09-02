export type ActivityType = 'REST' | 'AVAILABILITY' | 'WORK' | 'DRIVING' | 'UNKNOWN';

export type SlotType = 'DRIVER_1' | 'CREW_2';

export type CardStatus = 'INSERTED' | 'NOT_INSERTED';

export type InfractionSeverity = 'MINOR' | 'SERIOUS' | 'VERY_SERIOUS' | 'MOST_SERIOUS';

export type InfractionType = 
  | 'CONTINUOUS_DRIVE_EXCEEDED'
  | 'SPLIT_BREAK_INVALID'
  | 'DAILY_DRIVE_EXCEEDED'
  | 'MAX_10H_DRIVES_EXCEEDED'
  | 'DAILY_REST_INSUFFICIENT'
  | 'MAX_REDUCED_RESTS_EXCEEDED'
  | 'WEEKLY_DRIVE_EXCEEDED'
  | 'BIWEEKLY_DRIVE_EXCEEDED'
  | 'WEEKLY_REST_INSUFFICIENT'
  | 'FERRY_REST_INTERRUPTED';

export interface ActivitySegment {
  id: string;
  timestamp: string; // ISO string
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  durationMinutes: number;
  activity: ActivityType;
  slot: SlotType;
  cardStatus: CardStatus;
  vehicleRegistration: string;
  startKm?: number;
  endKm?: number;
  specificCondition?: 'OUT_OF_SCOPE' | 'FERRY_TRAIN' | 'NONE';
}

export interface DayVehicle {
  registration: string;
  startKm: number;
  endKm: number;
  distanceKm: number;
}

export interface DayPlace {
  type: 'ENTRY' | 'EXIT';
  country: string;
  region?: string;
  timestamp: string;
  odometer: number;
}

export interface ContinuousDriveSegment {
  startTime: string;
  endTime: string;
  driveMinutes: number;
  qualifyingBreakMinutes: number;
  breakDetails: {
    firstBreakMin?: number;
    secondBreakMin?: number;
    singleBreakMin?: number;
    isValid: boolean;
  };
  isInfraction: boolean;
  excessMinutes: number;
}

export interface DaySummary {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  dayNameCz: string; // Pondělí, Úterý...
  shiftStart?: string; // ISO
  shiftEnd?: string; // ISO
  shiftDurationMinutes: number;
  totalDrivingMinutes: number;
  totalWorkMinutes: number;
  totalAvailabilityMinutes: number;
  totalRestMinutes: number;
  activities: ActivitySegment[];
  vehicles: DayVehicle[];
  places: DayPlace[];
  continuousDriveSegments: ContinuousDriveSegment[];
  isExtendedDrivingDay: boolean; // > 9h driving (allowed max 2x per week)
  dailyRestMinutes: number;
  dailyRestType: 'REGULAR_11H' | 'SPLIT_3H_9H' | 'REDUCED_9H' | 'INSUFFICIENT' | 'WEEKLY_REST' | 'NONE';
  infractions: Infraction[];
  isComplianceClean: boolean;
}

export interface Infraction {
  id: string;
  dateStr: string;
  timeStr: string;
  timestamp: string;
  type: InfractionType;
  severity: InfractionSeverity;
  severityLabelCz: string; // "Lehký (MI)", "Závažný (SI)", "Velmi závažný (VSI)", "Nejzávažnější (MSI)"
  articleRef: string; // e.g. "Čl. 7 Nařízení (ES) 561/2006"
  title: string;
  description: string;
  measuredValueStr: string;
  legalLimitStr: string;
  excessStr: string;
  fineEstimateCZK: string;
  fineEstimateEUR: string;
  pointsCZ?: number;
  recommendation: string;
  legalArticleNote: string;
}

export interface WeekSummary {
  weekNumber: number;
  year: number;
  startDateStr: string;
  endDateStr: string;
  totalDrivingMinutes: number;
  totalWorkMinutes: number;
  totalRestMinutes: number;
  daysCount: number;
  extended10hDrivesCount: number; // Max 2 allowed
  reducedDailyRestsCount: number; // Max 3 allowed
  weeklyRestMinutes: number;
  weeklyRestType: 'REGULAR_45H' | 'REDUCED_24H' | 'INSUFFICIENT' | 'IN_PROGRESS';
  compensationDueMinutes?: number;
  infractions: Infraction[];
  days: DaySummary[];
  isClean: boolean;
}

export interface BiWeeklySummary {
  periodLabel: string; // "Týden 34 + 35"
  weeks: [number, number];
  totalDrivingMinutes: number; // Max 90h (5400 min)
  limitMinutes: number; // 5400 min
  isExceeded: boolean;
  excessMinutes: number;
}

export interface DriverCardInfo {
  cardNumber: string;
  driverSurname: string;
  driverFirstNames: string;
  birthDate: string;
  issuingState: string;
  issuingAuthority: string;
  cardExpiryDate: string;
  cardIssueDate: string;
  drivingLicenseNumber: string;
  generation: 'Gen 1 (Digitální)' | 'Gen 2 (Smart Tachograf v1/v2)';
  cardStructureVersion: string;
  readTimestamp: string;
  fileSource: 'USB_SMARTCARD' | 'DDD_FILE' | 'SAMPLE_PROFILE';
  fileName?: string;
}

export interface FullTachographData {
  driver: DriverCardInfo;
  days: DaySummary[];
  weeks: WeekSummary[];
  biWeeks: BiWeeklySummary[];
  allInfractions: Infraction[];
  overallStats: {
    totalDaysAnalyzed: number;
    totalDrivingHours: number;
    totalWorkHours: number;
    totalRestHours: number;
    totalKmDriven: number;
    complianceScore: number; // 0 - 100%
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    totalInfractionsCount: number;
    infractionsBySeverity: {
      minor: number;
      serious: number;
      verySerious: number;
      mostSerious: number;
    };
    currentShiftRemaining: {
      continuousDriveRemainingMinutes: number;
      dailyDriveRemainingMinutes: number;
      canExtendTo10h: boolean;
      canUseReducedDailyRest: boolean;
      extendedDrivesUsedThisWeek: number;
      reducedRestsUsedThisWeek: number;
    };
  };
}

export interface ApduLogEntry {
  id: string;
  timestamp: string;
  direction: 'TX' | 'RX' | 'INFO' | 'ERROR';
  bytes: string;
  meaning: string;
  statusWord?: string;
}
