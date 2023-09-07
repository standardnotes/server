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
