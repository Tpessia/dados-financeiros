import Decimal from 'decimal.js';

// Fix Floating-point arithmetic (https://0.30000000000000004.com/)

export function round(num: number, precision: number): number;
export function round(num?: number, precision: number = 2) {
  if (num == null) return num;
  const factor = Math.pow(10, precision);
  const tempNumber = num * factor;
  const roundedTempNumber = Math.round(tempNumber);
  const roundError = Number.EPSILON >= Math.abs(tempNumber - roundedTempNumber);
  return roundError ? roundedTempNumber / factor : Math.round((num * factor) * (1 + Number.EPSILON)) / factor;
};

export const toPercent = (num: number) => {
    return Decimal.mul(num, 100).toNumber();
};

export const fromPercent = (num: number) => {
    return Decimal.div(num, 100).toNumber();
};

export const toCents = (num: number) => {
    return Decimal.mul(num, 100).toNumber();
};

export const fromCents = (num: number) => {
    return Decimal.div(num, 100).toNumber();
};

// https://0.30000000000000004.com/
export const castPercent = (num: number) => {
    const precision = num.toString().replace('.','').length;
    const result = num / 100;
    return +result.toPrecision(precision);
};

export const DecimalPrecision = (function() {
    // https://stackoverflow.com/a/48764436
    return {
        // Decimal round (half away from zero)
        round: function(num, decimalPlaces) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 + Number.EPSILON);
            return Math.round(n) / p;
        },
        // Decimal ceil
        ceil: function(num, decimalPlaces) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 - Math.sign(num) * Number.EPSILON);
            return Math.ceil(n) / p;
        },
        // Decimal floor
        floor: function(num, decimalPlaces) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 + Math.sign(num) * Number.EPSILON);
            return Math.floor(n) / p;
        },
        // Decimal trunc
        trunc: function(num, decimalPlaces) {
            return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces);
        },
        // Format using fixed-point notation
        toFixed: function(num, decimalPlaces) {
            return this.round(num, decimalPlaces).toFixed(decimalPlaces);
        },
    };
})();