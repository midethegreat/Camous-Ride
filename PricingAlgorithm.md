# Pricing Algorithm Documentation

## Overview
This algorithm balances platform profitability, rider incentive, and student affordability by differentiating between fixed-price campus trips and dynamic-price off-campus trips.

## Logic Flow

```typescript
function calculateRideFare(params: RideParams) {
  const { pickup, destination, distanceKm, durationMin, isNight, demandLevel } = params;

  // 1. BOUNDARY CHECK (CAMPUS GEOPROXIMITY)
  // If the ride starts and ends within the campus perimeter
  if (isWithinCampus(pickup) && isWithinCampus(destination)) {
    return 200; // FIXED CAMPUS FARE (₦)
  }

  // 2. OFF-CAMPUS BASE CALCULATION
  const BASE_FARE = 500;
  const RATE_PER_KM = 150;
  const RATE_PER_MIN = 20;
  
  let fare = BASE_FARE + (distanceKm * RATE_PER_KM) + (durationMin * RATE_PER_MIN);

  // 3. DYNAMIC MULTIPLIER (SURGE/NIGHT)
  let multiplier = 1.0;
  
  if (isNight) {
    multiplier += 0.2; // +20% for night shifts
  }
  
  if (demandLevel === 'HIGH') {
    multiplier += 0.3; // +30% for high demand
  }

  // 4. SURGE CAP (MAX 1.5x)
  // Ensures off-campus rides remain reasonably priced
  multiplier = Math.min(multiplier, 1.5);
  
  fare *= multiplier;

  // 5. ROUNDING
  return Math.round(fare);
}
```

## Configuration (FARE_CONFIG)
- **CAMPUS_FIXED_FARE**: 200 ₦
- **OFF_CAMPUS_BASE**: 500 ₦
- **MAX_SURGE_MULTIPLIER**: 1.5x
