import { Aggregate, Result, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { ItemProps } from './ItemProps'

export class Item extends Aggregate<ItemProps> {
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

  calculateContentSize(): number {
    return Buffer.byteLength(JSON.stringify(this))
  }

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

  isIdenticalTo(item: Item): boolean {
    if (this._id.toString().toLowerCase() !== item._id.toString().toLowerCase()) {
      return false
    }

    const stringifiedThis = JSON.stringify(this.props)
    const stringifiedItem = JSON.stringify(item.props)

    const base64This = Buffer.from(stringifiedThis).toString('base64')
    const base64Item = Buffer.from(stringifiedItem).toString('base64')

    return base64This === base64Item
  }
}
