import { Result, Entity, UniqueEntityId } from '@standardnotes/domain-core'

import { StatisticMeasureProps } from './StatisticMeasureProps'

export class StatisticMeasure extends Entity<StatisticMeasureProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  get name(): string {
    return this.props.name.value
  }

  get value(): number {
    return this.props.value
  }

  private constructor(props: StatisticMeasureProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: StatisticMeasureProps, id?: UniqueEntityId): Result<StatisticMeasure> {
    return Result.ok<StatisticMeasure>(new StatisticMeasure(props, id))
  }
}
