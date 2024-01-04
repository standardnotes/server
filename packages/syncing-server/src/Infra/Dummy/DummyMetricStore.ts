import { MetricsStoreInterface } from '../../Domain/Metrics/MetricsStoreInterface'
import { Metric } from '../../Domain/Metrics/Metric'

export class DummyMetricStore implements MetricsStoreInterface {
  async storeMetric(_metric: Metric): Promise<void> {
    // do nothing
  }

  async getStatistics(
    _name: string,
    _from: number,
    _to: number,
  ): Promise<{ sum: number; max: number; min: number; sampleCount: number }> {
    return {
      sum: 0,
      max: 0,
      min: 0,
      sampleCount: 0,
    }
  }
}
