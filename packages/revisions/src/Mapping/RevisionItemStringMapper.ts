import { MapperInterface, Timestamps, Uuid } from '@standardnotes/domain-core'

import { ContentType } from '../Domain/Revision/ContentType'
import { Revision } from '../Domain/Revision/Revision'

export class RevisionItemStringMapper implements MapperInterface<Revision, string> {
  toDomain(projection: string): Revision {
    const item = JSON.parse(projection)

    const contentTypeOrError = ContentType.create(item.content_type)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not map item string to revision: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const itemUuidOrError = Uuid.create(item.uuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Could not map item string to revision: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    const revisionOrError = Revision.create({
      itemUuid,
      authHash: item.auth_hash,
      content: item.content,
      contentType,
      itemsKeyId: item.items_key_id,
      encItemKey: item.enc_item_key,
      creationDate: new Date(),
      timestamps: Timestamps.create(new Date(), new Date()).getValue(),
    })

    if (revisionOrError.isFailed()) {
      throw new Error(`Could not map item string to revision: ${revisionOrError.getError()}`)
    }

    return revisionOrError.getValue()
  }

  toProjection(domain: Revision): string {
    return JSON.stringify(domain)
  }
}
