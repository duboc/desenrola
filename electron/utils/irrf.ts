/**
 * IRRF (Imposto de Renda Retido na Fonte) Calculation (2025 Table)
 * Base = Gross Salary - INSS - Dependents Deduction (R$189.59 per dependent)
 */

interface IRRFBracket {
  min: number
  max: number
  rate: number
  deduction: number
}

const IRRF_BRACKETS_2025: IRRFBracket[] = [
  { min: 0, max: 2259.20, rate: 0, deduction: 0 },
  { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
  { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
  { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
  { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 },
]

const DEPENDENT_DEDUCTION = 189.59

export function calculateIRRF(
  grossSalary: number,
  inssDeduction: number,
  dependents: number = 0
): number {
  const baseCalculo = grossSalary - inssDeduction - (dependents * DEPENDENT_DEDUCTION)

  if (baseCalculo <= IRRF_BRACKETS_2025[0].max) return 0

  for (const bracket of IRRF_BRACKETS_2025) {
    if (baseCalculo >= bracket.min && baseCalculo <= bracket.max) {
      const irrf = (baseCalculo * bracket.rate) - bracket.deduction
      return Math.max(0, Math.round(irrf * 100) / 100)
    }
  }

  // Above all brackets — use highest
  const lastBracket = IRRF_BRACKETS_2025[IRRF_BRACKETS_2025.length - 1]
  const irrf = (baseCalculo * lastBracket.rate) - lastBracket.deduction
  return Math.max(0, Math.round(irrf * 100) / 100)
}

export function getIRRFBracketInfo(
  grossSalary: number,
  inssDeduction: number,
  dependents: number = 0
) {
  const baseCalculo = grossSalary - inssDeduction - (dependents * DEPENDENT_DEDUCTION)
  const irrf = calculateIRRF(grossSalary, inssDeduction, dependents)
  const effectiveRate = grossSalary > 0 ? (irrf / grossSalary) * 100 : 0

  let currentBracket = IRRF_BRACKETS_2025[0]
  for (const bracket of IRRF_BRACKETS_2025) {
    if (baseCalculo >= bracket.min) {
      currentBracket = bracket
    }
  }

  return {
    baseCalculo: Math.round(baseCalculo * 100) / 100,
    deduction: irrf,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    nominalRate: currentBracket.rate * 100,
    bracket: currentBracket,
    isExempt: irrf === 0,
    dependentDeduction: dependents * DEPENDENT_DEDUCTION,
  }
}

export { IRRF_BRACKETS_2025, DEPENDENT_DEDUCTION }
