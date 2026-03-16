export interface FareParams {
  distanceKm: number;
  durationMinutes: number;
  isNight: boolean;
  isSurge: boolean;
}

export const FARE_CONFIG = {
  CAMPUS_FIXED_FARE: 200, // FIXED CAMPUS PRICE (NO SURGE)
  BASE_FARE: 500, // OFF-CAMPUS BASE
  KM_RATE: 150, // OFF-CAMPUS KM RATE
  MIN_RATE: 20, // OFF-CAMPUS MIN RATE
  SURGE_MULTIPLIER: 1.3,
  MAX_SURGE_CAP: 1.5, // MAXIMUM SURGE CAP (1.5x)
  CAMPUS_MAX_FARE: 1200,
  COMMISSION_RATE: 0.15,
  NIGHT_COMMISSION_RATE: 0.1, // Lower commission at night to incentivize riders
};

export const calculateFare = (
  params: FareParams,
  isCampusRide: boolean = true,
) => {
  // A. CAMPUS FIXED PRICING (NO SURGE)
  if (isCampusRide) {
    return FARE_CONFIG.CAMPUS_FIXED_FARE;
  }

  // B. OFF-CAMPUS DYNAMIC PRICING
  let fare = FARE_CONFIG.BASE_FARE;
  fare += params.distanceKm * FARE_CONFIG.KM_RATE;
  fare += params.durationMinutes * FARE_CONFIG.MIN_RATE;

  // Apply surge if applicable (Night/High demand)
  if (params.isNight || params.isSurge) {
    let multiplier = params.isNight ? 1.2 : 1.0;
    if (params.isSurge) multiplier += 0.3;

    // CAP SURGE AT 1.5x
    multiplier = Math.min(multiplier, FARE_CONFIG.MAX_SURGE_CAP);
    fare *= multiplier;
  }

  // Final sanity check for off-campus ceiling
  return Math.round(fare);
};

export const calculateCommission = (
  totalFare: number,
  isNight: boolean = false,
) => {
  const rate = isNight
    ? FARE_CONFIG.NIGHT_COMMISSION_RATE
    : FARE_CONFIG.COMMISSION_RATE;
  return totalFare * rate;
};
