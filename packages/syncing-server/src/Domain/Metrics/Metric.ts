import { Result, ValueObject } from '@standardnotes/domain-core'

import { MetricProps } from './MetricProps'

export class Metric extends ValueObject<MetricProps> {
  static readonly NAMES = {
    ItemCreated: 'ItemCreated',
    ItemUpdated: 'ItemUpdated',
  }

  static create(props: MetricProps): Result<Metric> {
    const isValidName = Object.values(this.NAMES).includes(props.name)
    if (!isValidName) {
      return Result.fail<Metric>(`Invalid metric name: ${props.name}`)
    } else {
      return Result.ok<Metric>(new Metric(props))
    }
  }
}
