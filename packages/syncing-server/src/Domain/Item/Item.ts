import { Aggregate, Change, Result, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

import { ItemProps } from './ItemProps'
import { SharedVaultAssociation } from '../SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../KeySystem/KeySystemAssociation'

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

  setSharedVaultAssociation(sharedVaultAssociation: SharedVaultAssociation): void {
    this.addChange(
      Change.create({
        aggregateRootUuid: this.uuid.value,
        changeType: this.props.sharedVaultAssociation ? Change.TYPES.Modify : Change.TYPES.Add,
        changeData: sharedVaultAssociation,
      }).getValue(),
    )

    this.props.sharedVaultAssociation = sharedVaultAssociation
  }

  unsetSharedVaultAssociation(): void {
    if (!this.props.sharedVaultAssociation) {
      return
    }

    this.addChange(
      Change.create({
        aggregateRootUuid: this.uuid.value,
        changeType: Change.TYPES.Remove,
        changeData: this.props.sharedVaultAssociation,
      }).getValue(),
    )
    this.props.sharedVaultAssociation = undefined
  }

  setKeySystemAssociation(keySystemAssociation: KeySystemAssociation): void {
    this.addChange(
      Change.create({
        aggregateRootUuid: this.uuid.value,
        changeType: this.props.keySystemAssociation ? Change.TYPES.Modify : Change.TYPES.Add,
        changeData: keySystemAssociation,
      }).getValue(),
    )

    this.props.keySystemAssociation = keySystemAssociation
  }

  unsetKeySystemAssociation(): void {
    if (!this.props.keySystemAssociation) {
      return
    }

    this.addChange(
      Change.create({
        aggregateRootUuid: this.uuid.value,
        changeType: Change.TYPES.Remove,
        changeData: this.props.keySystemAssociation,
      }).getValue(),
    )
    this.props.keySystemAssociation = undefined
  }
}
