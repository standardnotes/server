import { Entity } from '../Core/Entity'
import { Result } from '../Core/Result'
import { UniqueEntityId } from '../Core/UniqueEntityId'
import { SubscriptionProps } from './SubscriptionProps'

export class Subscription extends Entity<SubscriptionProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: SubscriptionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SubscriptionProps, id?: UniqueEntityId): Result<Subscription> {
    return Result.ok<Subscription>(new Subscription(props, id))
  }
}
