import { Metric } from './Metric'

export interface MetricsStoreInterface {
  storeUserBasedMetric(metric: Metric, value: number, userUuid: string): Promise<void>
  getUserBasedStatistics(
    name: string,
    timestamp: number,
  ): Promise<{
    sum: number
    max: number
    min: number
    sampleCount: number
  }>
  storeMetric(metric: Metric): Promise<void>
  getStatistics(
    name: string,
    from: number,
    to: number,
  ): Promise<{
    sum: number
    max: number
    min: number
    sampleCount: number
  }>
}
