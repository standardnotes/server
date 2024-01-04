import { MetricsStoreInterface } from '../../Domain/Metrics/MetricsStoreInterface'
import { Metric } from '../../Domain/Metrics/Metric'

export class DummyMetricStore implements MetricsStoreInterface {
  async getUserBasedStatistics(
    _name: string,
    _timestamp: number,
  ): Promise<{ sum: number; max: number; min: number; sampleCount: number }> {
    return {
      sum: 0,
      max: 0,
      min: 0,
      sampleCount: 0,
    }
  }

  async storeUserBasedMetric(_metric: Metric, _value: number, _userUuid: string): Promise<void> {
    // do nothing
  }

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
