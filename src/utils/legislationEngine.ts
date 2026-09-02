import { 
  ActivitySegment, 
  ContinuousDriveSegment, 
  DaySummary, 
  Infraction, 
  WeekSummary, 
  BiWeeklySummary, 
  FullTachographData,
  DriverCardInfo
} from '../types/tachograph';

const DAY_NAMES_CZ = [
  'Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'
];

/**
 * Format minutes into readable Czech "X hod Y min" or "HH:mm"
 */
export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatMinutesClock(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculate continuous driving periods and break validity according to Article 7
 */
export function analyzeContinuousDriving(activities: ActivitySegment[], dayDateStr: string): {
  segments: ContinuousDriveSegment[];
  infractions: Infraction[];
} {
  const segments: ContinuousDriveSegment[] = [];
  const infractions: Infraction[] = [];

  let accumulatedDriveMin = 0;
  let currentDriveStart: string | null = null;
  let currentDriveEnd: string | null = null;

  // Split break tracker: 1st part >= 15 min, 2nd part >= 30 min
  let firstSplitBreakMin = 0;
  let hasValidFirstSplitBreak = false;

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    const duration = act.durationMinutes;

    if (act.activity === 'DRIVING') {
      if (currentDriveStart === null) {
        currentDriveStart = act.timeStr;
      }
      currentDriveEnd = act.timeStr;
      accumulatedDriveMin += duration;

      // Check if continuous drive limit (270 min / 4.5h) is exceeded
      if (accumulatedDriveMin > 270) {
        const excess = accumulatedDriveMin - 270;
        // Check if we haven't already reported this exact infraction segment
        const existingInfraction = infractions.find(
          inf => inf.type === 'CONTINUOUS_DRIVE_EXCEEDED' && inf.timeStr === act.timeStr
        );

        if (!existingInfraction) {
          let severity: 'MINOR' | 'SERIOUS' | 'VERY_SERIOUS' = 'MINOR';
          let severityLabel = 'Lehký (MI)';
          let fineCZK = '1 000 – 3 000 Kč';
          let fineEUR = '50 – 150 €';

          if (excess > 90) {
            severity = 'VERY_SERIOUS';
            severityLabel = 'Velmi závažný (VSI)';
            fineCZK = '5 000 – 10 000 Kč';
            fineEUR = '250 – 500 €';
          } else if (excess > 30) {
            severity = 'SERIOUS';
            severityLabel = 'Závažný (SI)';
            fineCZK = '3 000 – 5 000 Kč';
            fineEUR = '150 – 300 €';
          }

          infractions.push({
            id: `inf_cont_${dayDateStr}_${act.timeStr}_${i}`,
            dateStr: dayDateStr,
            timeStr: act.timeStr,
            timestamp: act.timestamp,
            type: 'CONTINUOUS_DRIVE_EXCEEDED',
            severity,
            severityLabelCz: severityLabel,
            articleRef: 'Čl. 7 Nařízení (ES) 561/2006',
            title: 'Překročení nepřetržité doby řízení (max 4h 30m)',
            description: `Řízení trvalo ${formatMinutes(accumulatedDriveMin)} bez předepsané bezpečnostní přestávky (min. 45 min nebo dělená 15 + 30 min).`,
            measuredValueStr: formatMinutes(accumulatedDriveMin),
            legalLimitStr: '4 h 30 min (270 min)',
            excessStr: `+${formatMinutes(excess)}`,
            fineEstimateCZK: fineCZK,
            fineEstimateEUR: fineEUR,
            pointsCZ: severity === 'VERY_SERIOUS' ? 4 : 2,
            recommendation: 'Při dosažení 4h 30m jízdy je řidič povinen neprodleně zahájit nepřerušovanou přestávku minimálně 45 minut, případně předem využít dělenou přestávku (nejprve min. 15 min a poté min. 30 min).',
            legalArticleNote: 'Po čtyřech a půl hodinách řízení musí mít řidič nepřerušovanou přestávku nejméně 45 minut, pokud nezačíná doba odpočinku.'
          });
        }
      }
    } else if (act.activity === 'REST') {
      // Check for full 45m break or split breaks
      if (duration >= 45) {
        // Complete single qualifying break -> resets continuous driving completely
        if (accumulatedDriveMin > 0 && currentDriveStart) {
          segments.push({
            startTime: currentDriveStart,
            endTime: act.timeStr,
            driveMinutes: accumulatedDriveMin,
            qualifyingBreakMinutes: duration,
            breakDetails: {
              singleBreakMin: duration,
              isValid: true
            },
            isInfraction: accumulatedDriveMin > 270,
            excessMinutes: Math.max(0, accumulatedDriveMin - 270)
          });
        }
        accumulatedDriveMin = 0;
        currentDriveStart = null;
        firstSplitBreakMin = 0;
        hasValidFirstSplitBreak = false;
      } else if (duration >= 30 && hasValidFirstSplitBreak) {
        // Qualifying second part of split break (>= 30 min after >= 15 min) -> resets continuous driving
        if (accumulatedDriveMin > 0 && currentDriveStart) {
          segments.push({
            startTime: currentDriveStart,
            endTime: act.timeStr,
            driveMinutes: accumulatedDriveMin,
            qualifyingBreakMinutes: duration,
            breakDetails: {
              firstBreakMin: firstSplitBreakMin,
              secondBreakMin: duration,
              isValid: true
            },
            isInfraction: accumulatedDriveMin > 270,
            excessMinutes: Math.max(0, accumulatedDriveMin - 270)
          });
        }
        accumulatedDriveMin = 0;
        currentDriveStart = null;
        firstSplitBreakMin = 0;
        hasValidFirstSplitBreak = false;
      } else if (duration >= 15 && !hasValidFirstSplitBreak) {
        // First valid part of split break (>= 15 min)
        hasValidFirstSplitBreak = true;
        firstSplitBreakMin = duration;
      }
    }
  }

  // End of day remaining segment
  if (accumulatedDriveMin > 0 && currentDriveStart) {
    segments.push({
      startTime: currentDriveStart,
      endTime: currentDriveEnd || activities[activities.length - 1]?.timeStr || '23:59',
      driveMinutes: accumulatedDriveMin,
      qualifyingBreakMinutes: 0,
      breakDetails: {
        firstBreakMin: firstSplitBreakMin > 0 ? firstSplitBreakMin : undefined,
        isValid: false
      },
      isInfraction: accumulatedDriveMin > 270,
      excessMinutes: Math.max(0, accumulatedDriveMin - 270)
    });
  }

  return { segments, infractions };
}

/**
 * Process a collection of daily activities into comprehensive DaySummaries
 */
export function processRawDays(
  rawDays: {
    dateStr: string;
    activities: ActivitySegment[];
    vehicles?: { registration: string; startKm: number; endKm: number }[];
    places?: { type: 'ENTRY' | 'EXIT'; country: string; timestamp: string; odometer: number }[];
  }[]
): DaySummary[] {
  return rawDays.map((rawDay, dayIndex, allRawDays) => {
    const dateObj = new Date(rawDay.dateStr + 'T12:00:00Z');
    const dayOfWeek = dateObj.getUTCDay();
    const dayNameCz = DAY_NAMES_CZ[dayOfWeek];

    let totalDrivingMinutes = 0;
    let totalWorkMinutes = 0;
    let totalAvailabilityMinutes = 0;
    let totalRestMinutes = 0;

    const activities = rawDay.activities;
    let shiftStart: string | undefined;
    let shiftEnd: string | undefined;

    // Calculate shift boundaries (first non-rest or card insert to last)
    for (let i = 0; i < activities.length; i++) {
      const act = activities[i];
      if (act.activity === 'DRIVING') totalDrivingMinutes += act.durationMinutes;
      else if (act.activity === 'WORK') totalWorkMinutes += act.durationMinutes;
      else if (act.activity === 'AVAILABILITY') totalAvailabilityMinutes += act.durationMinutes;
      else if (act.activity === 'REST') totalRestMinutes += act.durationMinutes;

      if (act.activity !== 'REST' && !shiftStart) {
        shiftStart = act.timestamp;
      }
      if (act.activity !== 'REST') {
        shiftEnd = act.timestamp;
      }
    }

    const { segments, infractions: contInfractions } = analyzeContinuousDriving(
      activities,
      rawDay.dateStr
    );

    // Calculate vehicles used
    const vehicles: DaySummary['vehicles'] = (rawDay.vehicles || []).map(v => ({
      registration: v.registration,
      startKm: v.startKm,
      endKm: v.endKm,
      distanceKm: Math.max(0, v.endKm - v.startKm)
    }));

    // Daily rest evaluation (including cross-day rest into next day and within 24h shift cycle):
    let maxConsecutiveRestMinutes = 0;
    let currentRestStreak = 0;
    let shiftStartMinuteOfDay = -1;
    let shiftEndMinuteOfDay = -1;
    let currentMinTracker = 0;

    for (const act of activities) {
      if (act.activity !== 'REST' && shiftStartMinuteOfDay === -1) {
        shiftStartMinuteOfDay = currentMinTracker;
      }
      if (act.activity !== 'REST') {
        shiftEndMinuteOfDay = currentMinTracker + act.durationMinutes;
      }

      if (act.activity === 'REST') {
        currentRestStreak += act.durationMinutes;
        if (currentRestStreak > maxConsecutiveRestMinutes) {
          maxConsecutiveRestMinutes = currentRestStreak;
        }
      } else {
        currentRestStreak = 0;
      }
      currentMinTracker += act.durationMinutes;
    }

    // Check rest extending into next day (Inter-day rest across midnight)
    let restExtendingIntoNextDay = 0;
    let restIn24hWindow = 0;
    
    if (shiftEndMinuteOfDay >= 0) {
      const restTillMidnight = Math.max(0, 1440 - shiftEndMinuteOfDay);
      let nextDayRestStart = 0;
      let nextDayFirstWorkMin = 1440;

      if (dayIndex + 1 < allRawDays.length) {
        const nextDayActs = allRawDays[dayIndex + 1].activities;
        let nextMin = 0;
        for (const na of nextDayActs) {
          if (na.activity === 'REST') {
            nextDayRestStart += na.durationMinutes;
          } else {
            nextDayFirstWorkMin = nextMin;
            break;
          }
          nextMin += na.durationMinutes;
        }
      } else {
        // If it's the last day in record, assume regular rest continues
        nextDayRestStart = 660;
        nextDayFirstWorkMin = 660;
      }

      restExtendingIntoNextDay = restTillMidnight + nextDayRestStart;
      // Within the 24h window from shift start (e.g. 05:10 on Day 1 to 05:10 on Day 2)
      const allowedNextDayMinutes = shiftStartMinuteOfDay >= 0 ? shiftStartMinuteOfDay : 360;
      restIn24hWindow = restTillMidnight + Math.min(nextDayFirstWorkMin, allowedNextDayMinutes);
      
      maxConsecutiveRestMinutes = Math.max(maxConsecutiveRestMinutes, restExtendingIntoNextDay, restIn24hWindow);
    }

    // Determine rest type for day
    let dailyRestType: DaySummary['dailyRestType'] = 'NONE';
    const isPureRestDay = totalDrivingMinutes === 0 && totalWorkMinutes === 0;

    if (isPureRestDay) {
      // Clean non-driving / rest day
      dailyRestType = maxConsecutiveRestMinutes >= 45 * 60 ? 'WEEKLY_REST' : 'REGULAR_11H';
      maxConsecutiveRestMinutes = Math.max(maxConsecutiveRestMinutes, 1440);
    } else if (maxConsecutiveRestMinutes >= 45 * 60) {
      dailyRestType = 'WEEKLY_REST';
    } else if (maxConsecutiveRestMinutes >= 11 * 60 || restIn24hWindow >= 11 * 60) {
      dailyRestType = 'REGULAR_11H';
    } else if (maxConsecutiveRestMinutes >= 9 * 60 || restIn24hWindow >= 9 * 60) {
      dailyRestType = 'REDUCED_9H';
    } else {
      dailyRestType = 'INSUFFICIENT';
    }

    // Country Continuity and Place Entry/Exit Validation (Article 34 (6) & (7) of Regulation (EU) 165/2014 & Mobility Package I)
    const dayPlaces = rawDay.places || [];
    const placeInfractions: Infraction[] = [];

    if (!isPureRestDay) {
      // 1. Identify start place (ENTRY) and end place (EXIT) for this active shift
      const startPlace = dayPlaces.find(p => p.type === 'ENTRY') || dayPlaces[0];
      const endPlace = [...dayPlaces].reverse().find(p => p.type === 'EXIT');

      // Find previous active day with places
      let prevActiveDay: (typeof allRawDays)[number] | null = null;
      for (let pi = dayIndex - 1; pi >= 0; pi--) {
        const candidate = allRawDays[pi];
        const hadDriveOrWork = candidate.activities.some(a => a.activity === 'DRIVING' || a.activity === 'WORK');
        if (hadDriveOrWork || (candidate.places && candidate.places.length > 0)) {
          prevActiveDay = candidate;
          break;
        }
      }

      let prevEndCountry: string | null = null;
      if (prevActiveDay && prevActiveDay.places && prevActiveDay.places.length > 0) {
        const prevPlaces = prevActiveDay.places;
        const prevExit = [...prevPlaces].reverse().find(p => p.type === 'EXIT');
        prevEndCountry = prevExit ? prevExit.country : prevPlaces[prevPlaces.length - 1].country;
      }

      // Check A: Missing Start Country (Chybějící symbol výchozí země na začátku směny)
      if (!startPlace) {
        placeInfractions.push({
          id: `inf_startcountry_${rawDay.dateStr}`,
          dateStr: rawDay.dateStr,
          timeStr: shiftStart ? shiftStart.split('T')[1]?.slice(0, 5) || '06:00' : '06:00',
          timestamp: shiftStart || `${rawDay.dateStr}T06:00:00Z`,
          type: 'MISSING_START_COUNTRY',
          severity: 'SERIOUS',
          severityLabelCz: 'Závažný (SI)',
          articleRef: 'Čl. 34 odst. 7 Nařízení (EU) 165/2014',
          title: 'Chybějící symbol výchozí země na začátku směny',
          description: prevEndCountry 
            ? `Při zahájení směny nebyl do tachografu zadán symbol výchozí země (ENTRY). Vzhledem k předchozímu ukončení směny v zemi [${prevEndCountry}] měla být zadána výchozí země [${prevEndCountry}].`
            : 'Při zahájení denní pracovní doby nebyl do tachografu zadán symbol výchozí země (ENTRY).',
          measuredValueStr: 'Chybí symbol výchozí země',
          legalLimitStr: 'Povinné zadání symbolu státu na začátku pracovní doby',
          excessStr: 'Záznam chybí',
          fineEstimateCZK: '2 000 – 5 000 Kč',
          fineEstimateEUR: '100 – 250 €',
          pointsCZ: 0,
          recommendation: 'Při zahájení každé denní pracovní doby (vložení karty nebo ukončení odpočinku) je řidič povinen v tachografu potvrdit nebo zadat symbol výchozího státu.',
          legalArticleNote: 'Řidič zadá do digitálního tachografu symboly zemí, ve kterých zahajuje a ukončuje svou denní pracovní dobu.'
        });
      } else if (prevEndCountry && startPlace.country !== prevEndCountry) {
        // Normalize country codes (e.g., 'DE' vs 'D')
        const normCurrent = startPlace.country.trim().toUpperCase();
        const normPrev = prevEndCountry.trim().toUpperCase();
        const isMatch = normCurrent === normPrev || 
          (normCurrent === 'DE' && normPrev === 'D') || 
          (normCurrent === 'D' && normPrev === 'DE');

        if (!isMatch) {
          const hasFerryOrSpecial = activities.some(a => a.specificCondition === 'FERRY_TRAIN' || a.specificCondition === 'OUT_OF_SCOPE') ||
            (prevActiveDay?.activities || []).some(a => a.specificCondition === 'FERRY_TRAIN' || a.specificCondition === 'OUT_OF_SCOPE');

          if (!hasFerryOrSpecial) {
            placeInfractions.push({
              id: `inf_country_mismatch_${rawDay.dateStr}`,
              dateStr: rawDay.dateStr,
              timeStr: startPlace.timestamp ? startPlace.timestamp.split('T')[1]?.slice(0, 5) || '06:00' : '06:00',
              timestamp: startPlace.timestamp || `${rawDay.dateStr}T06:00:00Z`,
              type: 'COUNTRY_CONTINUITY_ERROR',
              severity: 'SERIOUS',
              severityLabelCz: 'Závažný (SI)',
              articleRef: 'Čl. 34 odst. 6 a 7 Nařízení (EU) 165/2014',
              title: 'Neshoda výchozí země s místem ukončení předchozí směny',
              description: `Předchozí směna (${prevActiveDay?.dateStr}) skončila v zemi [${prevEndCountry}], avšak nová směna byla zahájena se symbolem [${startPlace.country}] bez zaznamenané přepravy. Chybí výchozí země [${prevEndCountry}].`,
              measuredValueStr: `Zadáno: ${startPlace.country} (ukončeno v: ${prevEndCountry})`,
              legalLimitStr: `Výchozí země musí navazovat na zemi ukončení (${prevEndCountry})`,
              excessStr: 'Neshoda návaznosti státu',
              fineEstimateCZK: '3 000 – 5 000 Kč',
              fineEstimateEUR: '150 – 250 €',
              pointsCZ: 0,
              recommendation: `Při zahájení směny po odpočinku v zahraničí (zde [${prevEndCountry}]) musíte jako výchozí zemi zadat [${prevEndCountry}]. Symbol ${startPlace.country} lze zadat až po návratu nebo překročení státních hranic.`,
              legalArticleNote: 'Symboly zemí zadávané do tachografu musí odpovídat skutečnému geografickému místu zahájení a ukončení pracovní doby.'
            });
          }
        }
      }

      // Check C: If vehicle traveled across borders (e.g. from CZ into foreign country) but end country was not entered
      if (startPlace && !endPlace && dayPlaces.length === 1 && totalDrivingMinutes > 120) {
        // Only if multiple vehicle journeys or if border crossing detected
      }
    }

    // Safety guarantee: If no driving or work occurred on this day, there can NEVER be any infractions
    const finalInfractions = isPureRestDay ? [] : [...contInfractions, ...placeInfractions];

    const daySummary: DaySummary = {
      dateStr: rawDay.dateStr,
      dayOfWeek,
      dayNameCz,
      shiftStart,
      shiftEnd,
      shiftDurationMinutes: totalDrivingMinutes + totalWorkMinutes + totalAvailabilityMinutes,
      totalDrivingMinutes,
      totalWorkMinutes,
      totalAvailabilityMinutes,
      totalRestMinutes,
      activities,
      vehicles,
      places: rawDay.places || [],
      continuousDriveSegments: segments,
      isExtendedDrivingDay: totalDrivingMinutes > 9 * 60,
      dailyRestMinutes: maxConsecutiveRestMinutes,
      dailyRestType,
      infractions: finalInfractions,
      isComplianceClean: finalInfractions.length === 0
    };

    return daySummary;
  });
}

/**
 * Group days into calendar weeks (Monday to Sunday) and apply weekly/bi-weekly rules
 */
export function evaluateWeeklyAndBiWeeklyCompliance(
  days: DaySummary[]
): {
  weeks: WeekSummary[];
  biWeeks: BiWeeklySummary[];
  allInfractions: Infraction[];
} {
  // Sort days ascending by date
  const sortedDays = [...days].sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  const weekMap = new Map<string, DaySummary[]>();

  sortedDays.forEach(day => {
    const d = new Date(day.dateStr + 'T12:00:00Z');
    // Compute ISO week number
    const target = new Date(d.valueOf());
    const dayNr = (d.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
    }
    const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const year = d.getUTCFullYear();
    const key = `${year}-W${String(weekNum).padStart(2, '0')}`;

    if (!weekMap.has(key)) {
      weekMap.set(key, []);
    }
    weekMap.get(key)!.push(day);
  });

  const weeks: WeekSummary[] = [];
  const allInfractions: Infraction[] = [];

  // Evaluate each week
  weekMap.forEach((weekDays, key) => {
    const [yearStr, wPart] = key.split('-W');
    const year = parseInt(yearStr, 10);
    const weekNumber = parseInt(wPart, 10);

    let totalDrivingMinutes = 0;
    let totalWorkMinutes = 0;
    let totalRestMinutes = 0;
    let extended10hDrivesCount = 0;
    let reducedDailyRestsCount = 0;

    const weekInfractions: Infraction[] = [];

    // Collect day-level infractions and count daily 10h drives / reduced rests
    weekDays.forEach(day => {
      totalDrivingMinutes += day.totalDrivingMinutes;
      totalWorkMinutes += day.totalWorkMinutes;
      totalRestMinutes += day.totalRestMinutes;

      // Check daily driving limit
      if (day.totalDrivingMinutes > 10 * 60) {
        const excess = day.totalDrivingMinutes - 10 * 60;
        const inf: Infraction = {
          id: `inf_daydrive_${day.dateStr}`,
          dateStr: day.dateStr,
          timeStr: day.activities[day.activities.length - 1]?.timeStr || '23:00',
          timestamp: `${day.dateStr}T23:00:00Z`,
          type: 'DAILY_DRIVE_EXCEEDED',
          severity: excess > 60 ? 'VERY_SERIOUS' : 'SERIOUS',
          severityLabelCz: excess > 60 ? 'Velmi závažný (VSI)' : 'Závažný (SI)',
          articleRef: 'Čl. 6 odst. 1 Nařízení (ES) 561/2006',
          title: 'Překročení maximální denní doby řízení (max 10h)',
          description: `Denní doba řízení dosáhla ${formatMinutes(day.totalDrivingMinutes)} (limit je 10 hodin při povoleném prodloužení).`,
          measuredValueStr: formatMinutes(day.totalDrivingMinutes),
          legalLimitStr: '10 h 00 min (600 min)',
          excessStr: `+${formatMinutes(excess)}`,
          fineEstimateCZK: excess > 60 ? '5 000 – 10 000 Kč' : '3 000 – 5 000 Kč',
          fineEstimateEUR: excess > 60 ? '250 – 500 €' : '150 – 250 €',
          pointsCZ: 4,
          recommendation: 'Denní dobu řízení lze prodloužit na 10 hodin pouze 2x týdně a nesmí být nikdy překročena.',
          legalArticleNote: 'Denní doba řízení nesmí přesáhnout 9 hodin. Může však být nejvýše dvakrát za týden prodloužena na 10 hodin.'
        };
        day.infractions.push(inf);
        weekInfractions.push(inf);
      } else if (day.totalDrivingMinutes > 9 * 60) {
        extended10hDrivesCount++;
        // If driver used more than two 10h extensions in this single week
        if (extended10hDrivesCount > 2) {
          const excess = day.totalDrivingMinutes - 9 * 60;
          const inf: Infraction = {
            id: `inf_ext10h_${day.dateStr}`,
            dateStr: day.dateStr,
            timeStr: day.activities[day.activities.length - 1]?.timeStr || '23:00',
            timestamp: `${day.dateStr}T23:00:00Z`,
            type: 'MAX_10H_DRIVES_EXCEEDED',
            severity: 'SERIOUS',
            severityLabelCz: 'Závažný (SI)',
            articleRef: 'Čl. 6 odst. 1 Nařízení (ES) 561/2006',
            title: 'Překročení počtu povolených prodloužení řízení na 10h v týdnu',
            description: `V tomto týdnu byla již ${extended10hDrivesCount}. jízda přesahující standardních 9 hodin (povoleno max. 2x týdně).`,
            measuredValueStr: `${extended10hDrivesCount}x v týdnu`,
            legalLimitStr: 'Max 2x za kalendářní týden',
            excessStr: `+${extended10hDrivesCount - 2} navíc`,
            fineEstimateCZK: '3 000 – 6 000 Kč',
            fineEstimateEUR: '150 – 300 €',
            pointsCZ: 2,
            recommendation: 'Hlídejte si týdenní limit prodloužení na 10 hodin – třetí den v týdnu již musíte jízdu ukončit striktně do 9h 00m.',
            legalArticleNote: 'Denní doba řízení může být nejvýše dvakrát za týden prodloužena na 10 hodin.'
          };
          day.infractions.push(inf);
          weekInfractions.push(inf);
        }
      }

      // Check daily rest count
      if (day.dailyRestType === 'REDUCED_9H') {
        reducedDailyRestsCount++;
        if (reducedDailyRestsCount > 3) {
          const inf: Infraction = {
            id: `inf_redrest_${day.dateStr}`,
            dateStr: day.dateStr,
            timeStr: day.activities[0]?.timeStr || '06:00',
            timestamp: `${day.dateStr}T06:00:00Z`,
            type: 'MAX_REDUCED_RESTS_EXCEEDED',
            severity: 'SERIOUS',
            severityLabelCz: 'Závažný (SI)',
            articleRef: 'Čl. 8 odst. 4 Nařízení (ES) 561/2006',
            title: 'Překročení počtu zkrácených denních odpočinků',
            description: `Využit již ${reducedDailyRestsCount}. zkrácený denní odpočinek (< 11h). Povoleno je maximálně 3x mezi dvěma týdenními odpočinky.`,
            measuredValueStr: `${reducedDailyRestsCount}x zkrácený odpočinek`,
            legalLimitStr: 'Max 3x mezi dvěma týdenními odpočinky',
            excessStr: `+${reducedDailyRestsCount - 3} navíc`,
            fineEstimateCZK: '3 000 – 5 000 Kč',
            fineEstimateEUR: '150 – 250 €',
            recommendation: 'Mezi dvěma týdenními odpočinky smí mít řidič nejvýše tři zkrácené denní odpočinky (min 9h). Ostatní dny musí mít plných 11 hodin.',
            legalArticleNote: 'Řidič smí mít mezi dvěma týdenními dobami odpočinku nejvýše tři zkrácené denní doby odpočinku.'
          };
          day.infractions.push(inf);
          weekInfractions.push(inf);
        }
      } else if (day.dailyRestType === 'INSUFFICIENT') {
        const shortfall = 9 * 60 - day.dailyRestMinutes;
        const inf: Infraction = {
          id: `inf_insufrest_${day.dateStr}`,
          dateStr: day.dateStr,
          timeStr: '06:00',
          timestamp: `${day.dateStr}T06:00:00Z`,
          type: 'DAILY_REST_INSUFFICIENT',
          severity: shortfall > 120 ? 'VERY_SERIOUS' : 'SERIOUS',
          severityLabelCz: shortfall > 120 ? 'Velmi závažný (VSI)' : 'Závažný (SI)',
          articleRef: 'Čl. 8 odst. 2 Nařízení (ES) 561/2006',
          title: 'Nedostatečný denní odpočinek (méně než 9 hodin)',
          description: `V průběhu 24 hodin od zahájení směny byl odpočinek pouze ${formatMinutes(day.dailyRestMinutes)} (minimální zkrácený odpočinek je 9 hodin).`,
          measuredValueStr: formatMinutes(day.dailyRestMinutes),
          legalLimitStr: 'Min 9 h 00 min (zkrácený) / 11 h 00 min (běžný)',
          excessStr: `Chybí ${formatMinutes(shortfall)}`,
          fineEstimateCZK: shortfall > 120 ? '5 000 – 10 000 Kč' : '2 000 – 5 000 Kč',
          fineEstimateEUR: shortfall > 120 ? '250 – 500 €' : '100 – 250 €',
          pointsCZ: 4,
          recommendation: 'V každém 24hodinovém časovém úseku po skončení předchozího odpočinku musí mít řidič novou denní dobu odpočinku alespoň 9 nebo 11 hodin.',
          legalArticleNote: 'V průběhu každých 24 hodin po skončení předchozí denní nebo týdenní doby odpočinku musí mít řidič novou denní dobu odpočinku.'
        };
        day.infractions.push(inf);
        weekInfractions.push(inf);
      }

      // Add all day infractions to week collection
      day.infractions.forEach(inf => {
        if (!weekInfractions.some(wi => wi.id === inf.id)) {
          weekInfractions.push(inf);
        }
      });
      day.isComplianceClean = day.infractions.length === 0;
    });

    // Check Weekly driving limit (Max 56 hours / 3360 min)
    if (totalDrivingMinutes > 56 * 60) {
      const excess = totalDrivingMinutes - 56 * 60;
      const inf: Infraction = {
        id: `inf_weekdrive_${key}`,
        dateStr: weekDays[weekDays.length - 1].dateStr,
        timeStr: '23:59',
        timestamp: `${weekDays[weekDays.length - 1].dateStr}T23:59:00Z`,
        type: 'WEEKLY_DRIVE_EXCEEDED',
        severity: excess > 4 * 60 ? 'VERY_SERIOUS' : 'SERIOUS',
        severityLabelCz: excess > 4 * 60 ? 'Velmi závažný (VSI)' : 'Závažný (SI)',
        articleRef: 'Čl. 6 odst. 2 Nařízení (ES) 561/2006',
        title: 'Překročení týdenní doby řízení (max 56 hodin)',
        description: `Celková doba řízení v týdnu ${weekNumber} dosáhla ${formatMinutes(totalDrivingMinutes)} (limit je 56 hodin).`,
        measuredValueStr: formatMinutes(totalDrivingMinutes),
        legalLimitStr: '56 h 00 min (3 360 min)',
        excessStr: `+${formatMinutes(excess)}`,
        fineEstimateCZK: excess > 4 * 60 ? '8 000 – 15 000 Kč' : '4 000 – 8 000 Kč',
        fineEstimateEUR: excess > 4 * 60 ? '400 – 800 €' : '200 – 400 €',
        pointsCZ: 4,
        recommendation: 'Týdenní doba řízení (od pondělí 00:00 do neděle 24:00) nesmí za žádných okolností překročit 56 hodin.',
        legalArticleNote: 'Týdenní doba řízení nesmí přesáhnout 56 hodin.'
      };
      weekInfractions.push(inf);
    }

    // Weekly rest calculation
    let maxWeeklyRest = 0;
    weekDays.forEach(d => {
      if (d.dailyRestMinutes > maxWeeklyRest) {
        maxWeeklyRest = d.dailyRestMinutes;
      }
    });

    let weeklyRestType: WeekSummary['weeklyRestType'] = 'IN_PROGRESS';
    if (maxWeeklyRest >= 45 * 60) weeklyRestType = 'REGULAR_45H';
    else if (maxWeeklyRest >= 24 * 60) weeklyRestType = 'REDUCED_24H';
    else if (weekDays.length >= 6) weeklyRestType = 'INSUFFICIENT';

    const weekSummary: WeekSummary = {
      weekNumber,
      year,
      startDateStr: weekDays[0].dateStr,
      endDateStr: weekDays[weekDays.length - 1].dateStr,
      totalDrivingMinutes,
      totalWorkMinutes,
      totalRestMinutes,
      daysCount: weekDays.length,
      extended10hDrivesCount,
      reducedDailyRestsCount,
      weeklyRestMinutes: maxWeeklyRest,
      weeklyRestType,
      infractions: weekInfractions,
      days: weekDays,
      isClean: weekInfractions.length === 0
    };

    weeks.push(weekSummary);
    allInfractions.push(...weekInfractions);
  });

  // Calculate Bi-weekly driving (pairs of consecutive weeks)
  const biWeeks: BiWeeklySummary[] = [];
  for (let i = 0; i < weeks.length - 1; i++) {
    const w1 = weeks[i];
    const w2 = weeks[i + 1];
    const combinedDrive = w1.totalDrivingMinutes + w2.totalDrivingMinutes;
    const limit = 90 * 60; // 5400 min
    const isExceeded = combinedDrive > limit;
    const excessMinutes = Math.max(0, combinedDrive - limit);

    if (isExceeded) {
      const inf: Infraction = {
        id: `inf_biweek_${w1.weekNumber}_${w2.weekNumber}`,
        dateStr: w2.endDateStr,
        timeStr: '23:59',
        timestamp: `${w2.endDateStr}T23:59:00Z`,
        type: 'BIWEEKLY_DRIVE_EXCEEDED',
        severity: excessMinutes > 10 * 60 ? 'MOST_SERIOUS' : 'VERY_SERIOUS',
        severityLabelCz: excessMinutes > 10 * 60 ? 'Nejzávažnější (MSI)' : 'Velmi závažný (VSI)',
        articleRef: 'Čl. 6 odst. 3 Nařízení (ES) 561/2006',
        title: 'Překročení dvoutýdenní doby řízení (max 90 hodin)',
        description: `Doba řízení za 2 po sobě jdoucí týdny (Týdny ${w1.weekNumber} + ${w2.weekNumber}) byla ${formatMinutes(combinedDrive)} (limit je 90 hodin).`,
        measuredValueStr: formatMinutes(combinedDrive),
        legalLimitStr: '90 h 00 min (5 400 min)',
        excessStr: `+${formatMinutes(excessMinutes)}`,
        fineEstimateCZK: '10 000 – 20 000 Kč',
        fineEstimateEUR: '500 – 1 000 €',
        pointsCZ: 4,
        recommendation: 'Pokud jste v jednom týdnu odřídili např. 54 hodin, v následujícím týdnu smíte odřídit maximálně 36 hodin, aby součet nepřesáhl 90h.',
        legalArticleNote: 'Celková doba řízení nesmí přesáhnout 90 hodin za dvě po sobě následující týdny.'
      };
      allInfractions.push(inf);
      w2.infractions.push(inf);
    }

    biWeeks.push({
      periodLabel: `Týden ${w1.weekNumber} + ${w2.weekNumber}`,
      weeks: [w1.weekNumber, w2.weekNumber],
      totalDrivingMinutes: combinedDrive,
      limitMinutes: limit,
      isExceeded,
      excessMinutes
    });
  }

  // Deduplicate allInfractions
  const uniqueInfractionsMap = new Map<string, Infraction>();
  allInfractions.forEach(inf => {
    if (!uniqueInfractionsMap.has(inf.id)) {
      uniqueInfractionsMap.set(inf.id, inf);
    }
  });

  return {
    weeks,
    biWeeks,
    allInfractions: Array.from(uniqueInfractionsMap.values())
  };
}

/**
 * Generate complete FullTachographData object
 */
export function buildFullTachographData(
  driver: DriverCardInfo,
  days: DaySummary[]
): FullTachographData {
  const { weeks, biWeeks, allInfractions } = evaluateWeeklyAndBiWeeklyCompliance(days);

  let totalDrivingMins = 0;
  let totalWorkMins = 0;
  let totalRestMins = 0;
  let totalKmDriven = 0;

  days.forEach(d => {
    totalDrivingMins += d.totalDrivingMinutes;
    totalWorkMins += d.totalWorkMinutes;
    totalRestMins += d.totalRestMinutes;
    d.vehicles.forEach(v => {
      totalKmDriven += v.distanceKm;
    });
  });

  const minorCount = allInfractions.filter(i => i.severity === 'MINOR').length;
  const seriousCount = allInfractions.filter(i => i.severity === 'SERIOUS').length;
  const verySeriousCount = allInfractions.filter(i => i.severity === 'VERY_SERIOUS').length;
  const mostSeriousCount = allInfractions.filter(i => i.severity === 'MOST_SERIOUS').length;

  // Compliance score calculation (0 - 100)
  // Deduct points based on infractions severity
  const penalty = (minorCount * 5) + (seriousCount * 15) + (verySeriousCount * 30) + (mostSeriousCount * 50);
  const complianceScore = Math.max(0, Math.min(100, 100 - penalty));

  let riskLevel: FullTachographData['overallStats']['riskLevel'] = 'LOW';
  if (mostSeriousCount > 0 || verySeriousCount >= 2 || penalty >= 40) {
    riskLevel = 'CRITICAL';
  } else if (verySeriousCount > 0 || seriousCount >= 2 || penalty >= 20) {
    riskLevel = 'HIGH';
  } else if (seriousCount > 0 || minorCount > 0) {
    riskLevel = 'MEDIUM';
  }

  // Calculate current/last active day remaining allowances
  const lastDay = days[days.length - 1];
  const lastWeek = weeks[weeks.length - 1];

  let currentShiftDrive = lastDay ? lastDay.totalDrivingMinutes : 0;
  let extendedDrivesUsed = lastWeek ? lastWeek.extended10hDrivesCount : 0;
  let reducedRestsUsed = lastWeek ? lastWeek.reducedDailyRestsCount : 0;

  const canExtend = extendedDrivesUsed < 2;
  const dailyDriveLimit = canExtend ? 600 : 540;
  const dailyDriveRemaining = Math.max(0, dailyDriveLimit - currentShiftDrive);

  // Find last continuous drive in the current day
  const lastSegment = lastDay?.continuousDriveSegments[lastDay.continuousDriveSegments.length - 1];
  const currentContDrive = lastSegment ? lastSegment.driveMinutes : 0;
  const continuousDriveRemaining = Math.max(0, 270 - currentContDrive);

  return {
    driver,
    days,
    weeks,
    biWeeks,
    allInfractions,
    overallStats: {
      totalDaysAnalyzed: days.length,
      totalDrivingHours: Math.round((totalDrivingMins / 60) * 10) / 10,
      totalWorkHours: Math.round((totalWorkMins / 60) * 10) / 10,
      totalRestHours: Math.round((totalRestMins / 60) * 10) / 10,
      totalKmDriven,
      complianceScore,
      riskLevel,
      totalInfractionsCount: allInfractions.length,
      infractionsBySeverity: {
        minor: minorCount,
        serious: seriousCount,
        verySerious: verySeriousCount,
        mostSerious: mostSeriousCount
      },
      currentShiftRemaining: {
        continuousDriveRemainingMinutes: continuousDriveRemaining,
        dailyDriveRemainingMinutes: dailyDriveRemaining,
        canExtendTo10h: canExtend,
        canUseReducedDailyRest: reducedRestsUsed < 3,
        extendedDrivesUsedThisWeek: extendedDrivesUsed,
        reducedRestsUsedThisWeek: reducedRestsUsed
      }
    }
  };
}
