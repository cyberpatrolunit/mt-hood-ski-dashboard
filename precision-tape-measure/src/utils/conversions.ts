// Unit conversion utilities

export type ImperialUnit = 'inches' | 'feet';
export type MetricUnit = 'mm' | 'cm' | 'm';
export type UnitSystem = 'imperial' | 'metric';

// Conversion constants
const INCH_TO_MM = 25.4;
const INCH_TO_CM = 2.54;
const INCH_TO_M = 0.0254;
const FEET_TO_INCHES = 12;

export function inchesToMm(inches: number): number {
  return inches * INCH_TO_MM;
}

export function inchesToCm(inches: number): number {
  return inches * INCH_TO_CM;
}

export function inchesToM(inches: number): number {
  return inches * INCH_TO_M;
}

export function mmToInches(mm: number): number {
  return mm / INCH_TO_MM;
}

export function cmToInches(cm: number): number {
  return cm / INCH_TO_CM;
}

export function mToInches(m: number): number {
  return m / INCH_TO_M;
}

export function feetToInches(feet: number): number {
  return feet * FEET_TO_INCHES;
}

export function inchesToFeet(inches: number): number {
  return inches / FEET_TO_INCHES;
}

export function convertToBaseUnit(
  value: number,
  unit: ImperialUnit | MetricUnit
): number {
  // Convert everything to inches for imperial, mm for metric
  switch (unit) {
    case 'inches':
      return value;
    case 'feet':
      return feetToInches(value);
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    case 'm':
      return value * 1000;
    default:
      return value;
  }
}

export function convertFromInches(
  inches: number,
  targetUnit: ImperialUnit | MetricUnit
): number {
  switch (targetUnit) {
    case 'inches':
      return inches;
    case 'feet':
      return inchesToFeet(inches);
    case 'mm':
      return inchesToMm(inches);
    case 'cm':
      return inchesToCm(inches);
    case 'm':
      return inchesToM(inches);
    default:
      return inches;
  }
}

export function convertFromMm(
  mm: number,
  targetUnit: ImperialUnit | MetricUnit
): number {
  switch (targetUnit) {
    case 'mm':
      return mm;
    case 'cm':
      return mm / 10;
    case 'm':
      return mm / 1000;
    case 'inches':
      return mmToInches(mm);
    case 'feet':
      return inchesToFeet(mmToInches(mm));
    default:
      return mm;
  }
}
