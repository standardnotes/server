import { StatisticMeasure } from './StatisticMeasure'

export interface StatisticMeasureRepositoryInterface {
  save(statisticMeasure: StatisticMeasure): Promise<void>
}
