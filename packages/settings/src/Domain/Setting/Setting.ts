import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SettingProps } from './SettingProps'

export class Setting extends Entity<SettingProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: SettingProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SettingProps, id?: UniqueEntityId): Result<Setting> {
    return Result.ok<Setting>(new Setting(props, id))
  }
}
