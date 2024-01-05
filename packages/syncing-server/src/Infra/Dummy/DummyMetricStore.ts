import { Uuid } from '@standardnotes/domain-core'

import { MetricsStoreInterface } from '../../Domain/Metrics/MetricsStoreInterface'
import { Metric } from '../../Domain/Metrics/Metric'
import { MetricsSummary } from '../../Domain/Metrics/MetricsSummary'

export class DummyMetricStore implements MetricsStoreInterface {
  async getUserBasedMetricsSummaryWithinTimeRange(_dto: {
    metricName: string
    userUuid: Uuid
    from: Date
    to: Date
  }): Promise<MetricsSummary> {
    return {
      sum: 0,
      max: 0,
      min: 0,
      sampleCount: 0,
    }
  }

  async getUserBasedMetricsSummary(_name: string, _timestamp: number): Promise<MetricsSummary> {
    return {
      sum: 0,
      max: 0,
      min: 0,
      sampleCount: 0,
    }
  }

  async storeUserBasedMetric(_metric: Metric, _value: number, _userUuid: Uuid): Promise<void> {
    // do nothing
  }

  async storeMetric(_metric: Metric): Promise<void> {
    // do nothing
  }

  async getMetricsSummary(_name: string, _from: number, _to: number): Promise<MetricsSummary> {
    return {
      sum: 0,
      max: 0,
      min: 0,
      sampleCount: 0,
    }
  }
}
