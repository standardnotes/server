import { Period } from './Period'

export interface PeriodKeyGeneratorInterface {
  getPeriodKey(period: Period): string
  getDiscretePeriodKeys(period: Period): string[]
}
