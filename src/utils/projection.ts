import { FinanceData } from '../context/FinanceContext';

export function buildProjection(
  data: FinanceData,
  mode: 'daily' | 'monthly' | 'yearly',
  startDate: Date = new Date()
): { points: number[]; labels: string[] } {
  const { savings, monthlyIncome, monthlyExpenses, annualGrowthRate } = data;
  const monthlyNet = Math.max(0, monthlyIncome - monthlyExpenses);

  const stepsPerYear = mode === 'daily' ? 365 : mode === 'monthly' ? 12 : 1;
  const years = mode === 'daily' ? 1 : mode === 'monthly' ? 10 : 30;
  const steps = stepsPerYear * years;

  const ratePerStep = Math.pow(1 + annualGrowthRate, 1 / stepsPerYear) - 1;
  const contribPerStep = (monthlyNet * 12) / stepsPerYear;

  const points: number[] = new Array(steps + 1).fill(0);
  const labels: string[] = new Array(steps + 1).fill('');

  let value = savings;
  points[0] = value;
  labels[0] = formatLabel(startDate, mode);

  for (let i = 1; i <= steps; i++) {
    value = value * (1 + ratePerStep) + contribPerStep;
    points[i] = value;
    const dateI = addStep(startDate, mode, i);
    labels[i] = formatLabel(dateI, mode);
  }

  return { points, labels };
}

function addStep(d: Date, mode: 'daily' | 'monthly' | 'yearly', step: number): Date {
  if (mode === 'daily') {
    const res = new Date(d);
    res.setDate(res.getDate() + step);
    return res;
  }
  if (mode === 'monthly') {
    const res = new Date(d.getFullYear(), d.getMonth() + step, 1);
    return res;
  }
  // yearly
  return new Date(d.getFullYear() + step, 0, 1);
}

function formatLabel(d: Date, mode: 'daily' | 'monthly' | 'yearly'): string {
  if (mode === 'daily') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  }
  if (mode === 'monthly') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }
  // yearly
  return new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(d);
}
