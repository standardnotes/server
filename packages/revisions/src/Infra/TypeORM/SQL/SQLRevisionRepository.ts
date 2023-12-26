import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { Logger } from 'winston'

import { Revision } from '../../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../../../Domain/Revision/RevisionRepositoryInterface'
import { SQLRevision } from './SQLRevision'

export class SQLRevisionRepository implements RevisionRepositoryInterface {
  constructor(
    protected ormRepository: Repository<SQLRevision>,
    protected revisionMetadataMapper: MapperInterface<RevisionMetadata, SQLRevision>,
    protected revisionMapper: MapperInterface<Revision, SQLRevision>,
    protected logger: Logger,
  ) {}

  async removeByItemUuid(itemUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('revisions_revisions')
      .where('item_uuid = :itemUuid', { itemUuid: itemUuid.value })
      .execute()
  }

  async removeByUserUuid(userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('revisions_revisions')
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .execute()
  }

  async removeOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('revisions_revisions')
      .where('uuid = :revisionUuid AND user_uuid = :userUuid', {
        userUuid: userUuid.value,
        revisionUuid: revisionUuid.value,
      })
      .execute()
  }

  async findOneByUuid(revisionUuid: Uuid, userUuid: Uuid, sharedVaultUuids: Uuid[]): Promise<Revision | null> {
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

  async clearSharedVaultAndKeySystemAssociations(dto: { itemUuid?: Uuid; sharedVaultUuid: Uuid }): Promise<void> {
    const queryBuilder = this.ormRepository.createQueryBuilder().update().set({
      sharedVaultUuid: null,
      keySystemIdentifier: null,
    })

    if (dto.itemUuid !== undefined) {
      queryBuilder.where('item_uuid = :itemUuid AND shared_vault_uuid = :sharedVaultUuid', {
        itemUuid: dto.itemUuid.value,
        sharedVaultUuid: dto.sharedVaultUuid.value,
      })
    } else {
      queryBuilder.where('shared_vault_uuid = :sharedVaultUuid', {
        sharedVaultUuid: dto.sharedVaultUuid.value,
      })
    }

    await queryBuilder.execute()
  }

  async findMetadataByItemId(
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
      .addSelect('item_uuid', 'itemUuid')
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

  async countByUserUuid(userUuid: Uuid): Promise<number> {
    return this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .getCount()
  }

  async findByUserUuid(dto: { userUuid: Uuid; offset?: number; limit?: number }): Promise<Revision[]> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('revision')
      .where('revision.user_uuid = :userUuid', { userUuid: dto.userUuid.value })
      .orderBy('revision.created_at', 'ASC')

    if (dto.offset !== undefined) {
      queryBuilder.skip(dto.offset)
    }

    if (dto.limit !== undefined) {
      queryBuilder.take(dto.limit)
    }

    const sqlRevisions = await queryBuilder.getMany()

    const revisions = []
    for (const sqlRevision of sqlRevisions) {
      revisions.push(this.revisionMapper.toDomain(sqlRevision))
    }

    return revisions
  }

  async updateUserUuid(itemUuid: Uuid, userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        userUuid: userUuid.value,
      })
      .where('item_uuid = :itemUuid', { itemUuid: itemUuid.value })
      .execute()
  }

  async findByItemUuid(itemUuid: Uuid): Promise<Revision[]> {
    const SQLRevisions = await this.ormRepository
      .createQueryBuilder()
      .where('item_uuid = :itemUuid', { itemUuid: itemUuid.value })
      .getMany()

    const revisions = []
    for (const revision of SQLRevisions) {
      revisions.push(this.revisionMapper.toDomain(revision))
    }

    return revisions
  }

  async insert(revision: Revision): Promise<boolean> {
    const projection = this.revisionMapper.toProjection(revision)

    await this.ormRepository.insert(projection)

    return true
  }

  async update(revision: Revision): Promise<boolean> {
    const projection = this.revisionMapper.toProjection(revision)

    const { uuid, ...rest } = projection

    await this.ormRepository.update({ uuid: uuid }, rest)

    return true
  }
}
