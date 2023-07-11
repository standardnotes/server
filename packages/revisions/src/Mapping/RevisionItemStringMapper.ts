import { MapperInterface, Dates, Uuid, ContentType } from '@standardnotes/domain-core'

import { Revision } from '../Domain/Revision/Revision'

export class RevisionItemStringMapper implements MapperInterface<Revision, string> {
  toDomain(projection: string): Revision {
    const item = JSON.parse(projection).item

    const contentTypeOrError = ContentType.create(item.content_type)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not map item string to revision [content type]: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const itemUuidOrError = Uuid.create(item.uuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Could not map item string to revision [item uuid]: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    const userUuidOrError = Uuid.create(item.user_uuid)
    if (userUuidOrError.isFailed()) {
      throw new Error(`Could not map item string to revision [user uuid]: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const revisionOrError = Revision.create({
      itemUuid,
      userUuid,
      authHash: item.auth_hash,
      content: item.content,
      contentType,
      itemsKeyId: item.items_key_id,
      encItemKey: item.enc_item_key,
      creationDate: new Date(),
      dates: Dates.create(new Date(), new Date()).getValue(),
    })

    if (revisionOrError.isFailed()) {
      throw new Error(`Could not map item string to revision [revision]: ${revisionOrError.getError()}`)
    }

    return revisionOrError.getValue()
  }

  toProjection(domain: Revision): string {
    return JSON.stringify(domain)
  }
}
