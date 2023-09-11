import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { Logger } from 'winston'

import { Revision } from '../../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { SQLLegacyRevisionRepository } from './SQLLegacyRevisionRepository'
import { SQLRevision } from './SQLRevision'

export class SQLRevisionRepository extends SQLLegacyRevisionRepository {
  constructor(
    protected override ormRepository: Repository<SQLRevision>,
    protected override revisionMetadataMapper: MapperInterface<RevisionMetadata, SQLRevision>,
    protected override revisionMapper: MapperInterface<Revision, SQLRevision>,
    protected override logger: Logger,
  ) {
    super(ormRepository, revisionMetadataMapper, revisionMapper, logger)
  }

  override async findOneByUuid(revisionUuid: Uuid, userUuid: Uuid, sharedVaultUuids: Uuid[]): Promise<Revision | null> {
    const queryBuilder = this.ormRepository.createQueryBuilder()

    if (sharedVaultUuids.length > 0) {
      queryBuilder.where(
        'uuid = :revisionUuid AND (user_uuid = :userUuid OR shared_vault_uuid IN (:...sharedVaultUuids))',
        {
          revisionUuid: revisionUuid.value,
          userUuid: userUuid.value,
          sharedVaultUuids: sharedVaultUuids.map((uuid) => uuid.value),
        },
      )
    } else {
      queryBuilder.where('uuid = :revisionUuid AND user_uuid = :userUuid', {
        revisionUuid: revisionUuid.value,
        userUuid: userUuid.value,
      })
    }

    const sqlRevision = await queryBuilder.getOne()

    if (sqlRevision === null) {
      return null
    }

    return this.revisionMapper.toDomain(sqlRevision)
  }

  override async clearSharedVaultAndKeySystemAssociations(itemUuid: Uuid, sharedVaultUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        sharedVaultUuid: null,
        keySystemIdentifier: null,
      })
      .where('item_uuid = :itemUuid AND shared_vault_uuid = :sharedVaultUuid', {
        itemUuid: itemUuid.value,
        sharedVaultUuid: sharedVaultUuid.value,
      })
      .execute()
  }

  override async findMetadataByItemId(
    itemUuid: Uuid,
    userUuid: Uuid,
    sharedVaultUuids: Uuid[],
  ): Promise<Array<RevisionMetadata>> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder()
      .select('uuid', 'uuid')
      .addSelect('content_type', 'contentType')
      .addSelect('created_at', 'createdAt')
      .addSelect('updated_at', 'updatedAt')
      .addSelect('shared_vault_uuid', 'sharedVaultUuid')
      .orderBy('created_at', 'DESC')

    if (sharedVaultUuids.length > 0) {
      queryBuilder.where(
        'item_uuid = :itemUuid AND (user_uuid = :userUuid OR shared_vault_uuid IN (:...sharedVaultUuids))',
        {
          itemUuid: itemUuid.value,
          userUuid: userUuid.value,
          sharedVaultUuids: sharedVaultUuids.map((uuid) => uuid.value),
        },
      )
    } else {
      queryBuilder.where('item_uuid = :itemUuid AND user_uuid = :userUuid', {
        itemUuid: itemUuid.value,
        userUuid: userUuid.value,
      })
    }

    const simplifiedRevisions = await queryBuilder.getRawMany()

    this.logger.debug(
      `Found ${simplifiedRevisions.length} revisions entries for item ${itemUuid.value}`,
      simplifiedRevisions,
    )

    const metadata = []
    for (const simplifiedRevision of simplifiedRevisions) {
      metadata.push(this.revisionMetadataMapper.toDomain(simplifiedRevision))
    }

    return metadata
  }
}
