import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Philippine Peso currency
export function formatPeso(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Calculate SSS contribution based on monthly salary
export function calculateSSS(monthlySalary: number): number {
  if (monthlySalary <= 4250) return 180;
  if (monthlySalary <= 4750) return 202.50;
  if (monthlySalary <= 5250) return 225;
  if (monthlySalary <= 5750) return 247.50;
  if (monthlySalary <= 6250) return 270;
  if (monthlySalary <= 6750) return 292.50;
  if (monthlySalary <= 7250) return 315;
  if (monthlySalary <= 7750) return 337.50;
  if (monthlySalary <= 8250) return 360;
  if (monthlySalary <= 8750) return 382.50;
  if (monthlySalary <= 9250) return 405;
  if (monthlySalary <= 9750) return 427.50;
  if (monthlySalary <= 10250) return 450;
  if (monthlySalary <= 10750) return 472.50;
  if (monthlySalary <= 11250) return 495;
  if (monthlySalary <= 11750) return 517.50;
  if (monthlySalary <= 12250) return 540;
  if (monthlySalary <= 12750) return 562.50;
  if (monthlySalary <= 13250) return 585;
  if (monthlySalary <= 13750) return 607.50;
  if (monthlySalary <= 14250) return 630;
  if (monthlySalary <= 14750) return 652.50;
  if (monthlySalary <= 15250) return 675;
  if (monthlySalary <= 15750) return 697.50;
  if (monthlySalary <= 16250) return 720;
  if (monthlySalary <= 16750) return 742.50;
  if (monthlySalary <= 17250) return 765;
  if (monthlySalary <= 17750) return 787.50;
  if (monthlySalary <= 18250) return 810;
  if (monthlySalary <= 18750) return 832.50;
  if (monthlySalary <= 19250) return 855;
  if (monthlySalary <= 19750) return 877.50;
  if (monthlySalary <= 20250) return 900;
  if (monthlySalary <= 20750) return 922.50;
  if (monthlySalary <= 21250) return 945;
  if (monthlySalary <= 21750) return 967.50;
  if (monthlySalary <= 22250) return 990;
  if (monthlySalary <= 22750) return 1012.50;
  if (monthlySalary <= 23250) return 1035;
  if (monthlySalary <= 23750) return 1057.50;
  if (monthlySalary <= 24250) return 1080;
  if (monthlySalary <= 24750) return 1102.50;
  return 1125; // Maximum SSS contribution
}

// Calculate PhilHealth contribution (3% of monthly salary, split between employer and employee)
export function calculatePhilHealth(monthlySalary: number): number {
  const maxSalary = 80000; // PhilHealth ceiling
  const minSalary = 10000; // PhilHealth floor
  
  let baseSalary = monthlySalary;
  if (baseSalary > maxSalary) baseSalary = maxSalary;
  if (baseSalary < minSalary) baseSalary = minSalary;
  
  // Employee share is 1.5% (half of 3%)
  return baseSalary * 0.015;
}

// Calculate Pag-IBIG contribution
export function calculatePagIbig(monthlySalary: number): number {
  if (monthlySalary <= 1500) {
    return monthlySalary * 0.01; // 1% for salary ≤ 1,500
  } else {
    return monthlySalary * 0.02; // 2% for salary > 1,500, capped at 100
  }
}

// Calculate withholding tax based on BIR tax table
export function calculateWithholdingTax(monthlySalary: number): number {
  // Annual computation first, then divide by 12
  const annualSalary = monthlySalary * 12;
  
  let annualTax = 0;
  
  if (annualSalary <= 250000) {
    annualTax = 0;
  } else if (annualSalary <= 400000) {
    annualTax = (annualSalary - 250000) * 0.15;
  } else if (annualSalary <= 800000) {
    annualTax = 22500 + (annualSalary - 400000) * 0.20;
  } else if (annualSalary <= 2000000) {
    annualTax = 102500 + (annualSalary - 800000) * 0.25;
  } else if (annualSalary <= 8000000) {
    annualTax = 402500 + (annualSalary - 2000000) * 0.30;
  } else {
    annualTax = 2202500 + (annualSalary - 8000000) * 0.35;
  }
  
  return annualTax / 12;
}

// Calculate total deductions
export function calculateTotalDeductions(monthlySalary: number): {
  sss: number;
  philHealth: number;
  pagIbig: number;
  withholdingTax: number;
  total: number;
} {
  const sss = calculateSSS(monthlySalary);
  const philHealth = calculatePhilHealth(monthlySalary);
  const pagIbig = calculatePagIbig(monthlySalary);
  const withholdingTax = calculateWithholdingTax(monthlySalary);
  
  return {
    sss,
    philHealth,
    pagIbig,
    withholdingTax,
    total: sss + philHealth + pagIbig + withholdingTax,
  };
}

// Calculate net pay
export function calculateNetPay(
  baseSalary: number,
  overtimePay: number = 0,
  allowances: number = 0
): { grossPay: number; deductions: ReturnType<typeof calculateTotalDeductions>; netPay: number } {
  const grossPay = baseSalary + overtimePay + allowances;
  const deductions = calculateTotalDeductions(baseSalary);
  const netPay = grossPay - deductions.total;
  
  return { grossPay, deductions, netPay };
}

// Format date to MM/DD/YYYY
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// Calculate overtime pay
export function calculateOvertimePay(
  hourlyRate: number,
  hours: number,
  multiplier: number = 1.25
): number {
  return hourlyRate * hours * multiplier;
}

// Get hourly rate from monthly salary (based on 8 hours/day, 22 working days/month)
export function getHourlyRate(monthlySalary: number): number {
  return monthlySalary / (22 * 8);
}
