import { Period } from './Period'

export interface PeriodKeyGeneratorInterface {
  getPeriodKey(period: Period): string
  getDailyKey(date?: Date): string
  convertPeriodKeyToPeriod(periodKey: string): Period
  getDiscretePeriodKeys(period: Period): string[]
}
