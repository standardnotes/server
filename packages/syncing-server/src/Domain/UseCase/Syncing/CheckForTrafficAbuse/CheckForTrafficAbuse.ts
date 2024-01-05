import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { CheckForTrafficAbuseDTO } from './CheckForTrafficAbuseDTO'
import { MetricsStoreInterface } from '../../../Metrics/MetricsStoreInterface'
import { Metric } from '../../../Metrics/Metric'
import { MetricsSummary } from '../../../Metrics/MetricsSummary'

export class CheckForTrafficAbuse implements UseCaseInterface<MetricsSummary> {
  constructor(
    private metricsStore: MetricsStoreInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: CheckForTrafficAbuseDTO): Promise<Result<MetricsSummary>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const metricToCheckOrError = Metric.create({
      name: dto.metricToCheck,
      timestamp: this.timer.getTimestampInMicroseconds(),
    })
    if (metricToCheckOrError.isFailed()) {
      return Result.fail(metricToCheckOrError.getError())
    }
    const metricToCheck = metricToCheckOrError.getValue()

    const metricsSummary = await this.metricsStore.getUserBasedMetricsSummaryWithinTimeRange({
      metricName: metricToCheck.props.name,
      userUuid,
      from: this.timer.getUTCDateNMinutesAgo(dto.timeframeLengthInMinutes),
      to: this.timer.getUTCDate(),
    })

    if (metricsSummary.sum > dto.threshold) {
      return Result.fail(
        `Traffic abuse detected for metric: ${metricToCheck.props.name}. Usage ${metricsSummary.sum} is greater than threshold ${dto.threshold}`,
      )
    }

    return Result.ok(metricsSummary)
  }
}
