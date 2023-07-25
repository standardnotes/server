import { Aggregate, Result, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { ItemProps } from './ItemProps'

export class Item extends Aggregate<ItemProps> {
  get uuid(): Uuid {
    const uuidOrError = Uuid.create(this._id.toString())
    if (uuidOrError.isFailed()) {
      throw new Error(uuidOrError.getError())
    }

    return uuidOrError.getValue()
  }

  get sharedVaultUuid(): Uuid | null {
    if (!this.props.sharedVaultAssociation) {
      return null
    }

    return this.props.sharedVaultAssociation.props.sharedVaultUuid
  }

  isAssociatedWithASharedVault(): boolean {
    return this.sharedVaultUuid !== null
  }

  isAssociatedWithSharedVault(sharedVaultUuid: Uuid): boolean {
    if (!this.isAssociatedWithASharedVault()) {
      return false
    }

    return (this.sharedVaultUuid as Uuid).equals(sharedVaultUuid)
  }

  isAssociatedWithKeySystem(keySystemIdentifier: string): boolean {
    if (!this.props.keySystemAssociation) {
      return false
    }

    return this.props.keySystemAssociation.props.keySystemIdentifier === keySystemIdentifier
  }

  private constructor(props: ItemProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: ItemProps, id?: UniqueEntityId): Result<Item> {
    if (!props.contentSize) {
      const contentSize = Buffer.byteLength(JSON.stringify(props))
      props.contentSize = contentSize
    }

    return Result.ok<Item>(new Item(props, id))
  }
}
