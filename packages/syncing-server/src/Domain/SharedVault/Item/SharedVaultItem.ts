import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultItemProps } from './SharedVaultItemProps'

export class SharedVaultItem extends Entity<SharedVaultItemProps> {
  private constructor(props: SharedVaultItemProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SharedVaultItemProps, id?: UniqueEntityId): Result<SharedVaultItem> {
    return Result.ok<SharedVaultItem>(new SharedVaultItem(props, id))
  }
}
