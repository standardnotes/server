import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'

import { Revision } from '../Domain/Revision/Revision'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'
import { ProjectorInterface } from './ProjectorInterface'
import { RevisionProjection } from './RevisionProjection'
import { SimpleRevisionProjection } from './SimpleRevisionProjection'

@injectable()
export class RevisionProjector implements ProjectorInterface<Revision, RevisionProjection> {
  constructor(
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.RevisionService) private revisionService: RevisionServiceInterface,
  ) {}

  async projectSimple(revision: Revision): Promise<SimpleRevisionProjection> {
    return {
      uuid: revision.uuid,
      content_type: revision.contentType,
      required_role: this.revisionService.calculateRequiredRoleBasedOnRevisionDate(revision.createdAt),
      created_at: this.timer.convertDateToISOString(revision.createdAt),
      updated_at: this.timer.convertDateToISOString(revision.updatedAt),
    }
  }

  async projectFull(revision: Revision): Promise<RevisionProjection> {
    return {
      uuid: revision.uuid,
      item_uuid: (await revision.item).uuid,
      content: revision.content,
      content_type: revision.contentType,
      items_key_id: revision.itemsKeyId,
      enc_item_key: revision.encItemKey,
      auth_hash: revision.authHash,
      creation_date: this.timer.formatDate(revision.creationDate, 'YYYY-MM-DD'),
      required_role: this.revisionService.calculateRequiredRoleBasedOnRevisionDate(revision.createdAt),
      created_at: this.timer.convertDateToISOString(revision.createdAt),
      updated_at: this.timer.convertDateToISOString(revision.updatedAt),
    }
  }

  async projectCustom(_projectionType: string, _revision: Revision, ..._args: any[]): Promise<RevisionProjection> {
    throw new Error('not implemented')
  }
}
