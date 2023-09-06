import { Result, ValueObject } from '@standardnotes/domain-core'

import { SharedVaultAssociationProps } from './SharedVaultAssociationProps'

export class SharedVaultAssociation extends ValueObject<SharedVaultAssociationProps> {
  private constructor(props: SharedVaultAssociationProps) {
    super(props)
  }

  static create(props: SharedVaultAssociationProps): Result<SharedVaultAssociation> {
    return Result.ok<SharedVaultAssociation>(new SharedVaultAssociation(props))
  }
}
