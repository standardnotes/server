import { Aggregate, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { SharedVaultAssociationProps } from './SharedVaultAssociationProps'

export class SharedVaultAssociation extends Aggregate<SharedVaultAssociationProps> {
  private constructor(props: SharedVaultAssociationProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: SharedVaultAssociationProps, id?: UniqueEntityId): Result<SharedVaultAssociation> {
    return Result.ok<SharedVaultAssociation>(new SharedVaultAssociation(props, id))
  }
}
