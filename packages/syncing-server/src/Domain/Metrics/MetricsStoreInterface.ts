import { Uuid } from '@standardnotes/domain-core'

import { Metric } from './Metric'
import { MetricsSummary } from './MetricsSummary'

export interface MetricsStoreInterface {
  storeMetric(metric: Metric): Promise<void>
  storeUserBasedMetric(metric: Metric, value: number, userUuid: Uuid): Promise<void>
  getUserBasedMetricsSummaryWithinTimeRange(dto: {
    metricName: string
    userUuid: Uuid
    from: Date
    to: Date
  }): Promise<MetricsSummary>
  getUserBasedMetricsSummary(name: string, timestamp: number): Promise<MetricsSummary>
  getMetricsSummary(name: string, from: number, to: number): Promise<MetricsSummary>
}
