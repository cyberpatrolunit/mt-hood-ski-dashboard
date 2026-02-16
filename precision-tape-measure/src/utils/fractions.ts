// Fraction utilities for precise imperial measurements

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function decimalToFraction(
  decimal: number,
  maxDenominator: number
): { whole: number; numerator: number; denominator: number } {
  const whole = Math.floor(decimal);
  const fractionalPart = decimal - whole;

  if (fractionalPart === 0) {
    return { whole, numerator: 0, denominator: 1 };
  }

  let bestNumerator = 0;
  let bestDenominator = 1;
  let minError = Math.abs(fractionalPart);

  for (let denominator = 2; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(fractionalPart * denominator);
    const error = Math.abs(fractionalPart - numerator / denominator);

    if (error < minError) {
      minError = error;
      bestNumerator = numerator;
      bestDenominator = denominator;
    }

    if (error === 0) break;
  }

  // Simplify the fraction
  const divisor = gcd(bestNumerator, bestDenominator);
  const simplifiedNumerator = bestNumerator / divisor;
  const simplifiedDenominator = bestDenominator / divisor;

  return {
    whole,
    numerator: simplifiedNumerator,
    denominator: simplifiedDenominator,
  };
}

export function formatFraction(
  decimal: number,
  maxDenominator: number
): string {
  const { whole, numerator, denominator } = decimalToFraction(
    decimal,
    maxDenominator
  );

  if (numerator === 0) {
    return `${whole}"`;
  }

  if (whole === 0) {
    return `${numerator}/${denominator}"`;
  }

  return `${whole} ${numerator}/${denominator}"`;
}

export function formatDecimal(value: number, unit: string, precision: number = 2): string {
  return `${value.toFixed(precision)} ${unit}`;
}
