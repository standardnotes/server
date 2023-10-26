import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SubscriptionSettingProps } from './SubscriptionSettingProps'

export class SubscriptionSetting extends Entity<SubscriptionSettingProps> {
  private constructor(props: SubscriptionSettingProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SubscriptionSettingProps, id?: UniqueEntityId): Result<SubscriptionSetting> {
    return Result.ok<SubscriptionSetting>(new SubscriptionSetting(props, id))
  }
}
