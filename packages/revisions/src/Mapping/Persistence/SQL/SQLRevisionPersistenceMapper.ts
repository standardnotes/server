import { MapperInterface, Dates, UniqueEntityId, Uuid, ContentType } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { Revision } from '../../../Domain/Revision/Revision'
import { SQLRevision } from '../../../Infra/TypeORM/SQL/SQLRevision'
import { SharedVaultAssociation } from '../../../Domain/SharedVault/SharedVaultAssociation'
import { KeySystemAssociation } from '../../../Domain/KeySystem/KeySystemAssociation'

export class SQLRevisionPersistenceMapper implements MapperInterface<Revision, SQLRevision> {
  constructor(private timer: TimerInterface) {}

  toDomain(projection: SQLRevision): Revision {
    const contentTypeOrError = ContentType.create(projection.contentType)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const datesOrError = Dates.create(projection.createdAt, projection.updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${datesOrError.getError()}`)
    }
    const dates = datesOrError.getValue()

    const itemUuidOrError = Uuid.create(projection.itemUuid)
    if (itemUuidOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${itemUuidOrError.getError()}`)
    }
    const itemUuid = itemUuidOrError.getValue()

    let userUuid = null
    if (projection.userUuid !== null) {
      const userUuidOrError = Uuid.create(projection.userUuid)
      if (userUuidOrError.isFailed()) {
        throw new Error(`Could not map typeorm revision to domain revision: ${userUuidOrError.getError()}`)
      }
      userUuid = userUuidOrError.getValue()
    }

    let sharedVaultAssociation: SharedVaultAssociation | undefined = undefined
    if (projection.sharedVaultUuid && projection.editedBy) {
      const sharedVaultUuidOrError = Uuid.create(projection.sharedVaultUuid)
      if (sharedVaultUuidOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${sharedVaultUuidOrError.getError()}`)
      }
      const sharedVaultUuid = sharedVaultUuidOrError.getValue()

      const lastEditedByOrError = Uuid.create(projection.editedBy)
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
    if (projection.keySystemIdentifier) {
      const keySystemAssociationOrError = KeySystemAssociation.create(projection.keySystemIdentifier)
      if (keySystemAssociationOrError.isFailed()) {
        throw new Error(`Failed to create revision from projection: ${keySystemAssociationOrError.getError()}`)
      }
      keySystemAssociation = keySystemAssociationOrError.getValue()
    }

    const revisionOrError = Revision.create(
      {
        authHash: projection.authHash,
        content: projection.content,
        contentType,
        creationDate: new Date(this.timer.convertDateToFormattedString(projection.creationDate, 'YYYY-MM-DD')),
        encItemKey: projection.encItemKey,
        itemsKeyId: projection.itemsKeyId,
        itemUuid,
        userUuid,
        dates,
        sharedVaultAssociation,
        keySystemAssociation,
      },
      new UniqueEntityId(projection.uuid),
    )
    if (revisionOrError.isFailed()) {
      throw new Error(`Could not map typeorm revision to domain revision: ${revisionOrError.getError()}`)
    }

    return revisionOrError.getValue()
  }

  toProjection(domain: Revision): SQLRevision {
    const sqlRevision = new SQLRevision()

    sqlRevision.authHash = domain.props.authHash
    sqlRevision.content = domain.props.content
    sqlRevision.contentType = domain.props.contentType.value
    sqlRevision.createdAt = domain.props.dates.createdAt
    sqlRevision.updatedAt = domain.props.dates.updatedAt
    sqlRevision.creationDate = new Date(
      this.timer.convertDateToFormattedString(domain.props.creationDate, 'YYYY-MM-DD'),
    )
    sqlRevision.encItemKey = domain.props.encItemKey
    sqlRevision.itemUuid = domain.props.itemUuid.value
    sqlRevision.itemsKeyId = domain.props.itemsKeyId
    sqlRevision.userUuid = domain.props.userUuid ? domain.props.userUuid.value : null
    sqlRevision.uuid = domain.id.toString()
    sqlRevision.sharedVaultUuid = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.sharedVaultUuid.value
      : null
    sqlRevision.editedBy = domain.props.sharedVaultAssociation
      ? domain.props.sharedVaultAssociation.props.editedBy.value
      : null
    sqlRevision.keySystemIdentifier = domain.props.keySystemAssociation
      ? domain.props.keySystemAssociation.props.keySystemIdentifier
      : null

    return sqlRevision
  }
}
