import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SubscriptionProps } from './SubscriptionProps'

export class Subscription extends Entity<SubscriptionProps> {
  private constructor(props: SubscriptionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SubscriptionProps, id?: UniqueEntityId): Result<Subscription> {
    return Result.ok<Subscription>(new Subscription(props, id))
  }
}
