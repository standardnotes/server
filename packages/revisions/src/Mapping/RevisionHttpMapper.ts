import { MapperInterface } from '@standardnotes/domain-core'

import { Revision } from '../Domain/Revision/Revision'

export class RevisionHttpMapper
  implements
    MapperInterface<
      Revision,
      {
        uuid: string
        itemUuid: string
        content: string | null
        contentType: string
        itemsKeyId: string | null
        encItemKey: string | null
        authHash: string | null
        createAt: string
        updateAt: string
      }
    >
{
  toDomain(_projection: {
    uuid: string
    itemUuid: string
    userUuid: string | null
    content: string | null
    contentType: string
    itemsKeyId: string | null
    encItemKey: string | null
    authHash: string | null
    createAt: string
    updateAt: string
  }): Revision {
    throw new Error('Method not implemented.')
  }

  toProjection(domain: Revision): {
    uuid: string
    itemUuid: string
    content: string | null
    contentType: string
    itemsKeyId: string | null
    encItemKey: string | null
    authHash: string | null
    createAt: string
    updateAt: string
  } {
    return {
      uuid: domain.id.toString(),
      itemUuid: domain.props.itemUuid.value,
      content: domain.props.content,
      contentType: domain.props.contentType.value as string,
      itemsKeyId: domain.props.itemsKeyId,
      encItemKey: domain.props.encItemKey,
      authHash: domain.props.authHash,
      createAt: domain.props.dates.createdAt.toISOString(),
      updateAt: domain.props.dates.updatedAt.toISOString(),
    }
  }
}
