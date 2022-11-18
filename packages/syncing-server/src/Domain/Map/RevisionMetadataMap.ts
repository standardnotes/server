/* istanbul ignore file */
import { ContentType } from '@standardnotes/common'
import { MapperInterface, UniqueEntityId } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { SimpleRevisionProjection } from '../../Projection/SimpleRevisionProjection'
import { RevisionMetadata } from '../Revision/RevisionMetadata'
import { RevisionServiceInterface } from '../Revision/RevisionServiceInterface'

@injectable()
export class RevisionMetadataMap implements MapperInterface<RevisionMetadata, SimpleRevisionProjection> {
  constructor(
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  toDomain(persistence: SimpleRevisionProjection): RevisionMetadata {
    const revisionMetadatOrError = RevisionMetadata.create(
      {
        contentType: persistence.content_type,
        createdAt: this.timer.convertStringDateToDate(persistence.created_at),
        updatedAt: this.timer.convertStringDateToDate(persistence.updated_at),
      },
      new UniqueEntityId(persistence.uuid),
    )
    if (revisionMetadatOrError.isFailed()) {
      throw new Error(revisionMetadatOrError.getError())
    }

    return revisionMetadatOrError.getValue()
  }

  toProjection(domain: RevisionMetadata): SimpleRevisionProjection {
    return {
      uuid: domain.id.toString(),
      content_type: domain.props.contentType as ContentType | null,
      required_role: this.revisionService.calculateRequiredRoleBasedOnRevisionDate(domain.props.createdAt),
      created_at: this.timer.convertDateToISOString(domain.props.createdAt),
      updated_at: this.timer.convertDateToISOString(domain.props.updatedAt),
    }
  }
}
