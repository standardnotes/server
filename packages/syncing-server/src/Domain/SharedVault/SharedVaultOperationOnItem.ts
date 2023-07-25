import { ValueObject, Result } from '@standardnotes/domain-core'

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
    const isValidType = Object.values(this.TYPES).includes(props.type)
    if (!isValidType) {
      return Result.fail<SharedVaultOperationOnItem>(`Invalid shared vault operation type: ${props.type}`)
    }

    if (props.type === this.TYPES.MoveToOtherSharedVault && !props.targetSharedVaultUuid) {
      return Result.fail<SharedVaultOperationOnItem>('Missing target shared vault uuid')
    }

    return Result.ok<SharedVaultOperationOnItem>(new SharedVaultOperationOnItem(props))
  }
}
