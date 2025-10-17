const ANNUAL_RETURN = 0.1;
const MONTHLY_RATE = Math.pow(1 + ANNUAL_RETURN, 1 / 12) - 1;
const MONTHS = 15 * 12;
const YEARS = 15;
const STATE_SUPPORT_YEARS = 10;
const STATE_SUPPORT_LIMIT = 36000;
const STATE_SUPPORT_THRESHOLD = 2000;
const TAX_LIMIT = 400000;
const LIFE_EXPECTANCY_YEARS = 20;
const MATCH_BY_INCOME: Record<string, number> = {
  low: 1,
  mid: 0.5,
  high: 0.25,
};

const BASE_GROWTH = Math.pow(1 + MONTHLY_RATE, MONTHS);
const YEARLY_FACTOR = Math.pow(1 + MONTHLY_RATE, 12);

function weight(years: number): number {
  if (years <= 0) return 0;
  if (Math.abs(YEARLY_FACTOR - 1) < Number.EPSILON) {
    return years;
  }

  const startPower = Math.pow(YEARLY_FACTOR, YEARS - years);
  const numerator = Math.pow(YEARLY_FACTOR, years) - 1;
  const denominator = YEARLY_FACTOR - 1;
  return startPower * (numerator / denominator);
}

function annualStateSupport(matchPct: number, yearlyContribution: number): number {
  if (yearlyContribution < STATE_SUPPORT_THRESHOLD) {
    return 0;
  }
  return Math.min(STATE_SUPPORT_LIMIT, matchPct * yearlyContribution);
}

function annualTaxDeduction(ndflRate: number, yearlyContribution: number): number {
  return ndflRate * Math.min(yearlyContribution, TAX_LIMIT);
}

interface FutureCapitalParams {
  monthlyContribution: number;
  matchPct: number;
  ndflRate: number;
  reinvest: boolean;
}

function futureCapital({
  monthlyContribution,
  matchPct,
  ndflRate,
  reinvest,
}: FutureCapitalParams): number {
  const yearlyContribution = monthlyContribution * 12;
  const support = annualStateSupport(matchPct, yearlyContribution);
  const tax = annualTaxDeduction(ndflRate, yearlyContribution);

  const contributionsPart = monthlyContribution * ((BASE_GROWTH - 1) / MONTHLY_RATE);

  const statePart = support * weight(STATE_SUPPORT_YEARS);
  const taxPart = reinvest ? tax * weight(YEARS) : 0;

  return contributionsPart + statePart + taxPart;
}

interface FindMonthlyContributionParams {
  matchPct: number;
  ndflRate: number;
  reinvest: boolean;
}

function findMonthlyContribution(
  target: number,
  { matchPct, ndflRate, reinvest }: FindMonthlyContributionParams
): number {
  let low = 0;
  let high = 2_000_000;
  let mid = high;

  for (let i = 0; i < 80; i += 1) {
    mid = (low + high) / 2;
    const capital = futureCapital({
      monthlyContribution: mid,
      matchPct,
      ndflRate,
      reinvest,
    });

    if (capital >= target) {
      high = mid;
    } else {
      low = mid;
    }

    if (high - low < 0.01) {
      break;
    }
  }

  return high;
}

export interface CapitalLumpSumParams {
  targetSum: number;
  incomeLevel: string;
  ndflRate: number;
  reinvest: boolean;
}

export interface CapitalLumpSumResult {
  capital: number;
  monthlyContribution: number;
  personalTotal: number;
  stateTotal: number;
  annualStateSupport: number;
  taxYear: number;
  taxTotal: number;
  reinvestedTaxTotal: number;
  investmentIncome: number;
  lifePayment: number;
  tenYearPayment: number;
  lumpSum: number;
  matchPct: number;
}

export function calculateCapitalLumpSum({
  targetSum,
  incomeLevel,
  ndflRate,
  reinvest,
}: CapitalLumpSumParams): CapitalLumpSumResult {
  if (!Number.isFinite(targetSum) || targetSum <= 0) {
    throw new Error('Target sum is required for calculation');
  }

  const matchPct = MATCH_BY_INCOME[incomeLevel] ?? MATCH_BY_INCOME.high;
  const monthlyContribution = findMonthlyContribution(targetSum, {
    matchPct,
    ndflRate,
    reinvest,
  });

  const yearlyContribution = monthlyContribution * 12;
  const supportYear = annualStateSupport(matchPct, yearlyContribution);
  const taxYear = annualTaxDeduction(ndflRate, yearlyContribution);

  const capital = futureCapital({
    monthlyContribution,
    matchPct,
    ndflRate,
    reinvest,
  });

  const personalTotal = yearlyContribution * YEARS;
  const stateTotal = supportYear * STATE_SUPPORT_YEARS;
  const taxTotal = taxYear * YEARS;
  const reinvestedTaxTotal = reinvest ? taxTotal : 0;

  const investmentIncome = capital - (personalTotal + stateTotal + reinvestedTaxTotal);

  const lifePayment = capital / (LIFE_EXPECTANCY_YEARS * 12);
  const tenYearPayment = capital / (10 * 12);

  return {
    capital,
    monthlyContribution,
    personalTotal,
    stateTotal,
    annualStateSupport: supportYear,
    taxYear,
    taxTotal,
    reinvestedTaxTotal,
    investmentIncome,
    lifePayment,
    tenYearPayment,
    lumpSum: capital,
    matchPct,
  };
}

export default calculateCapitalLumpSum;
