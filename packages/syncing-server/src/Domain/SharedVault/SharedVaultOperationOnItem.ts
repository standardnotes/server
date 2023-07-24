import { ValueObject, Result, Uuid } from '@standardnotes/domain-core'

import { SharedVaultOperationOnItemProps } from './SharedVaultOperationOnItemProps'

export class SharedVaultOperationOnItem extends ValueObject<SharedVaultOperationOnItemProps> {
  static readonly TYPES = {
    AddToSharedVault: 'add-to-shared-vault',
    RemoveFromSharedVault: 'remove-from-shared-vault',
    MoveToOtherSharedVault: 'move-to-other-shared-vault',
    SaveToSharedVault: 'save-to-shared-vault',
    CreateToSharedVault: 'create-to-shared-vault',
  }

  private constructor(props: SharedVaultOperationOnItemProps) {
    super(props)
  }

  static create(props: SharedVaultOperationOnItemProps): Result<SharedVaultOperationOnItem> {
    const userUuidOrError = Uuid.create(props.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail<SharedVaultOperationOnItem>(userUuidOrError.getError())
    }

    const isValidType = Object.values(this.TYPES).includes(props.type)
    if (!isValidType) {
      return Result.fail<SharedVaultOperationOnItem>(`Invalid shared vault operation type: ${props.type}`)
    }

    const sharedVaultUuidOrError = Uuid.create(props.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail<SharedVaultOperationOnItem>(sharedVaultUuidOrError.getError())
    }

    if (props.targetSharedVaultUuid) {
      const targetSharedVaultUuidOrError = Uuid.create(props.targetSharedVaultUuid)
      if (targetSharedVaultUuidOrError.isFailed()) {
        return Result.fail<SharedVaultOperationOnItem>(targetSharedVaultUuidOrError.getError())
      }
    }

    if (props.type === this.TYPES.MoveToOtherSharedVault && !props.targetSharedVaultUuid) {
      return Result.fail<SharedVaultOperationOnItem>('Missing target shared vault uuid')
    }

    return Result.ok<SharedVaultOperationOnItem>(new SharedVaultOperationOnItem(props))
  }
}
