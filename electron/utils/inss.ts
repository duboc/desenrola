/**
 * INSS Progressive Calculation (2025 Table)
 * Each bracket is applied progressively (like income tax brackets)
 */

interface INSSBracket {
  min: number
  max: number
  rate: number
}

const INSS_BRACKETS_2025: INSSBracket[] = [
  { min: 0, max: 1518.00, rate: 0.075 },
  { min: 1518.01, max: 2793.88, rate: 0.09 },
  { min: 2793.89, max: 4190.83, rate: 0.12 },
  { min: 4190.84, max: 8157.41, rate: 0.14 },
]

const INSS_CEILING = 8157.41

export function calculateINSS(grossSalary: number): number {
  if (grossSalary <= 0) return 0

  let totalINSS = 0
  const salary = Math.min(grossSalary, INSS_CEILING)

  for (const bracket of INSS_BRACKETS_2025) {
    if (salary <= bracket.min) break

    const taxableInBracket = Math.min(salary, bracket.max) - bracket.min
    if (taxableInBracket > 0) {
      totalINSS += taxableInBracket * bracket.rate
    }
  }

  return Math.round(totalINSS * 100) / 100
}

/**
 * Quick reference deduction values per bracket
 * These are pre-calculated for the simplified method
 */
export const INSS_DEDUCTION_TABLE = [
  { max: 1518.00, rate: '7,5%', deduction: 0 },
  { max: 2793.88, rate: '9%', deduction: 22.77 },
  { max: 4190.83, rate: '12%', deduction: 106.59 },
  { max: 8157.41, rate: '14%', deduction: 190.40 },
]

export function getINSSBracketInfo(grossSalary: number) {
  const inss = calculateINSS(grossSalary)
  const effectiveRate = grossSalary > 0 ? (inss / grossSalary) * 100 : 0

  let bracketIndex = 0
  for (let i = 0; i < INSS_BRACKETS_2025.length; i++) {
    if (grossSalary <= INSS_BRACKETS_2025[i].max) {
      bracketIndex = i
      break
    }
    bracketIndex = i
  }

  return {
    deduction: inss,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    bracket: INSS_BRACKETS_2025[bracketIndex],
    ceiling: INSS_CEILING,
    isAboveCeiling: grossSalary > INSS_CEILING,
  }
}
