import { Result, Uuid, ValueObject } from '@standardnotes/domain-core'

import { ItemHashProps } from './ItemHashProps'

export class ItemHash extends ValueObject<ItemHashProps> {
  private constructor(props: ItemHashProps) {
    super(props)
  }

  static create(props: ItemHashProps): Result<ItemHash> {
    if (props.shared_vault_uuid) {
      const sharedVaultUuidOrError = Uuid.create(props.shared_vault_uuid)
      if (sharedVaultUuidOrError.isFailed()) {
        return Result.fail<ItemHash>(sharedVaultUuidOrError.getError())
      }
    }

    return Result.ok<ItemHash>(new ItemHash(props))
  }

  representsASharedVaultItem(): boolean {
    return this.props.shared_vault_uuid !== null
  }

  calculateContentSize(): number {
    return Buffer.byteLength(JSON.stringify(this))
  }

  get sharedVaultUuid(): Uuid | null {
    if (!this.representsASharedVaultItem()) {
      return null
    }

    return Uuid.create(this.props.shared_vault_uuid as string).getValue()
  }

  hasDedicatedKeySystemAssociation(): boolean {
    return this.props.key_system_identifier !== null
  }
}
