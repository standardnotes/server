import { Entity } from '../Core/Entity'
import { UniqueEntityId } from '../Core/UniqueEntityId'
import { SubscriptionProps } from './SubscriptionProps'

export class Subscription extends Entity<SubscriptionProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: SubscriptionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SubscriptionProps, id?: UniqueEntityId): Subscription {
    return new Subscription(props, id)
  }
}
