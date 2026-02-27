import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { salaryConfig } from '../db/schema'
import { eq } from 'drizzle-orm'
import { calculateINSS, getINSSBracketInfo } from '../utils/inss'
import { calculateIRRF, getIRRFBracketInfo } from '../utils/irrf'

export function registerSalaryHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('salary:getConfig', async () => {
    const db = getDb()
    return db.select().from(salaryConfig).where(eq(salaryConfig.isActive, true)).all()
  })

  ipcMain.handle('salary:saveConfig', async (_event, data: any) => {
    const db = getDb()

    if (data.id) {
      return db.update(salaryConfig).set(data).where(eq(salaryConfig.id, data.id)).returning().get()
    }

    // Auto-calculate deductions for CLT
    if (data.employmentType === 'clt' && data.grossSalary) {
      const inss = calculateINSS(data.grossSalary)
      const irrf = calculateIRRF(data.grossSalary, inss, data.dependents || 0)
      const fgts = data.grossSalary * 0.08

      const vtDeduction = data.valeTransporte
        ? data.grossSalary * ((data.vtDeductionPercent || 6) / 100)
        : 0

      const totalDeductions = inss + irrf + vtDeduction +
        (data.healthPlanDeduction || 0) +
        (data.dentalPlanDeduction || 0) +
        (data.otherDeductions || 0)

      data.inssDeduction = inss
      data.irrfDeduction = irrf
      data.fgtsMonthly = fgts
      data.netSalary = data.grossSalary - totalDeductions
    }

    return db.insert(salaryConfig).values(data).returning().get()
  })

  ipcMain.handle('salary:calculateNet', async (
    _event,
    grossSalary: number,
    dependents: number = 0
  ) => {
    const inss = calculateINSS(grossSalary)
    const irrf = calculateIRRF(grossSalary, inss, dependents)
    const fgts = grossSalary * 0.08
    const net = grossSalary - inss - irrf

    const inssInfo = getINSSBracketInfo(grossSalary)
    const irrfInfo = getIRRFBracketInfo(grossSalary, inss, dependents)

    return {
      grossSalary,
      inss: {
        value: inss,
        effectiveRate: inssInfo.effectiveRate,
        isAboveCeiling: inssInfo.isAboveCeiling,
      },
      irrf: {
        value: irrf,
        effectiveRate: irrfInfo.effectiveRate,
        nominalRate: irrfInfo.nominalRate,
        baseCalculo: irrfInfo.baseCalculo,
        isExempt: irrfInfo.isExempt,
      },
      fgts: {
        value: Math.round(fgts * 100) / 100,
        note: 'Pago pelo empregador, não desconta do salário',
      },
      netSalary: Math.round(net * 100) / 100,
      dependents,
    }
  })

  ipcMain.handle('salary:calculate13', async () => {
    const db = getDb()
    const configs = db.select().from(salaryConfig)
      .where(eq(salaryConfig.isActive, true))
      .all()

    return configs.map(config => {
      if (!config.grossSalary) return null

      const gross13 = config.grossSalary
      const inss13 = calculateINSS(gross13)
      const irrf13 = calculateIRRF(gross13, inss13)

      // 1ª parcela (November) — no deductions
      const firstInstallment = gross13 / 2

      // 2ª parcela (December) — all deductions applied
      const secondInstallment = gross13 - firstInstallment - inss13 - irrf13

      return {
        name: config.name,
        grossSalary: gross13,
        firstInstallment: Math.round(firstInstallment * 100) / 100,
        firstInstallmentMonth: 'Novembro',
        secondInstallment: Math.round(secondInstallment * 100) / 100,
        secondInstallmentMonth: 'Dezembro',
        totalNet: Math.round((firstInstallment + secondInstallment) * 100) / 100,
        inss: inss13,
        irrf: irrf13,
      }
    }).filter(Boolean)
  })
}
