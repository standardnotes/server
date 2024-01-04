import { Metric } from './Metric'

export interface MetricsStoreInterface {
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
