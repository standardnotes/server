import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { KeySystemAssociationProps } from './KeySystemAssocationProps'

export class KeySystemAssociation extends Entity<KeySystemAssociationProps> {
  private constructor(props: KeySystemAssociationProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: KeySystemAssociationProps, id?: UniqueEntityId): Result<KeySystemAssociation> {
    return Result.ok<KeySystemAssociation>(new KeySystemAssociation(props, id))
  }
}
