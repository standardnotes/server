import { Result, ValueObject } from '@standardnotes/domain-core'

import { ItemHashProps } from './ItemHashProps'

export class ItemHash extends ValueObject<ItemHashProps> {
  private constructor(props: ItemHashProps) {
    super(props)
  }

  static create(props: ItemHashProps): Result<ItemHash> {
    return Result.ok<ItemHash>(new ItemHash(props))
  }

  representsASharedVaultItem(): boolean {
    return this.props.shared_vault_uuid !== null
  }

  hasDedicatedKeySystemAssociation(): boolean {
    return this.props.key_system_identifier !== null
  }
}
