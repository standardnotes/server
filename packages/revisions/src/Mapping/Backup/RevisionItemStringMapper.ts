import { MapperInterface, Dates, Uuid, ContentType } from '@standardnotes/domain-core'

import { Revision } from '../../Domain/Revision/Revision'
import { SharedVaultAssociation } from '../../Domain/SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../Domain/KeySystem/KeySystemAssociation'

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

    let sharedVaultAssociation: SharedVaultAssociation | undefined = undefined
    if (item.shared_vault_uuid && item.last_edited_by) {
      const sharedVaultUuidOrError = Uuid.create(item.shared_vault_uuid)
      if (sharedVaultUuidOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${sharedVaultUuidOrError.getError()}`)
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const lastEditedByOrError = Uuid.create(item.last_edited_by)
      if (lastEditedByOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${lastEditedByOrError.getError()}`)
      }
      const lastEditedBy = lastEditedByOrError.getValue()

      const sharedVaultAssociationOrError = SharedVaultAssociation.create({
        sharedVaultUuid,
        editedBy: lastEditedBy,
      })
      if (sharedVaultAssociationOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${sharedVaultAssociationOrError.getError()}`)
      }
      sharedVaultAssociation = sharedVaultAssociationOrError.getValue()
    }

    let keySystemAssociation: KeySystemAssociation | undefined = undefined
    if (item.key_system_identifier) {
      const keySystemAssociationOrError = KeySystemAssociation.create(item.key_system_identifier)
      if (keySystemAssociationOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${keySystemAssociationOrError.getError()}`)
      }
      keySystemAssociation = keySystemAssociationOrError.getValue()
    }

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
      sharedVaultAssociation,
      keySystemAssociation,
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
