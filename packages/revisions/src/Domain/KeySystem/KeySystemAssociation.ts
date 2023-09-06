import { Result, Validator, ValueObject } from '@standardnotes/domain-core'

import { KeySystemAssociationProps } from './KeySystemAssocationProps'

export class KeySystemAssociation extends ValueObject<KeySystemAssociationProps> {
  private constructor(props: KeySystemAssociationProps) {
    super(props)
  }

  static create(keySystemIdentifier: string): Result<KeySystemAssociation> {
    const validationResult = Validator.isNotEmptyString(keySystemIdentifier)
    if (validationResult.isFailed()) {
      return Result.fail<KeySystemAssociation>(validationResult.getError())
    }

    return Result.ok<KeySystemAssociation>(new KeySystemAssociation({ keySystemIdentifier }))
  }
}
