import { UniqueEntityId, Entity, Result } from '@standardnotes/domain-core'

import { RevisionMetadataProps } from './RevisionMetadataProps'

export class RevisionMetadata extends Entity<RevisionMetadataProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: RevisionMetadataProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevisionMetadataProps, id?: UniqueEntityId): Result<RevisionMetadata> {
    if (!(props.createdAt instanceof Date)) {
      return Result.fail<RevisionMetadata>(`Could not create Revision Metadata. Creation date should be a date object, given: ${props.createdAt}`)
    }
    if (!(props.updatedAt instanceof Date)) {
      return Result.fail<RevisionMetadata>(`Could not create Revision Metadata. Update date should be a date object, given: ${props.updatedAt}`)
    }

    return Result.ok<RevisionMetadata>(new RevisionMetadata(props, id))
  }
}
