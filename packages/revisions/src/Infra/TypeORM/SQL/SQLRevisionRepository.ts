import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { Logger } from 'winston'

import { Revision } from '../../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../../../Domain/Revision/RevisionRepositoryInterface'
import { SQLRevision } from './SQLRevision'

export class SQLRevisionRepository implements RevisionRepositoryInterface {
  constructor(
    private ormRepository: Repository<SQLRevision>,
    private revisionMetadataMapper: MapperInterface<RevisionMetadata, SQLRevision>,
    private revisionMapper: MapperInterface<Revision, SQLRevision>,
    private logger: Logger,
  ) {}

  async countByUserUuid(userUuid: Uuid): Promise<number> {
    return this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .getCount()
  }

  async findByUserUuid(dto: { userUuid: Uuid; offset?: number; limit?: number }): Promise<Revision[]> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder()
      .where('user_uuid = :userUuid', { userUuid: dto.userUuid.value })
      .orderBy('created_at', 'ASC')

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

  async removeByUserUuid(userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('revisions')
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .execute()
  }

  async removeOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('revisions')
      .where('uuid = :revisionUuid AND user_uuid = :userUuid', {
        userUuid: userUuid.value,
        revisionUuid: revisionUuid.value,
      })
      .execute()
  }

  async findOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<Revision | null> {
    const SQLRevision = await this.ormRepository
      .createQueryBuilder()
      .where('uuid = :revisionUuid', { revisionUuid: revisionUuid.value })
      .andWhere('user_uuid = :userUuid', { userUuid: userUuid.value })
      .getOne()

    if (SQLRevision === null) {
      return null
    }

    return this.revisionMapper.toDomain(SQLRevision)
  }

  async save(revision: Revision): Promise<boolean> {
    const SQLRevision = this.revisionMapper.toProjection(revision)

    await this.ormRepository.save(SQLRevision)

    return true
  }

  async findMetadataByItemId(itemUuid: Uuid, userUuid: Uuid): Promise<Array<RevisionMetadata>> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder()
      .select('uuid', 'uuid')
      .addSelect('content_type', 'contentType')
      .addSelect('created_at', 'createdAt')
      .addSelect('updated_at', 'updatedAt')
      .where('item_uuid = :itemUuid', { itemUuid: itemUuid.value })
      .andWhere('user_uuid = :userUuid', { userUuid: userUuid.value })
      .orderBy('created_at', 'DESC')

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
