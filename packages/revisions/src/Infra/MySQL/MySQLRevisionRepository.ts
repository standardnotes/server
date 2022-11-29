import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { Revision } from '../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'
import { TypeORMRevision } from '../TypeORM/TypeORMRevision'

export class MySQLRevisionRepository implements RevisionRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMRevision>,
    private revisionMetadataMapper: MapperInterface<RevisionMetadata, TypeORMRevision>,
    private revisionMapper: MapperInterface<Revision, TypeORMRevision>,
  ) {}

  async findByItemUuid(itemUuid: Uuid): Promise<Revision[]> {
    const typeormRevisions = await this.ormRepository
      .createQueryBuilder()
      .where('item_uuid = :itemUuid', { itemUuid: itemUuid.value })
      .getMany()

    const revisions = []
    for (const revision of typeormRevisions) {
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
    const typeormRevision = await this.ormRepository
      .createQueryBuilder()
      .where('uuid = :revisionUuid', { revisionUuid: revisionUuid.value })
      .andWhere('user_uuid = :userUuid', { userUuid: userUuid.value })
      .getOne()

    if (typeormRevision === null) {
      return null
    }

    return this.revisionMapper.toDomain(typeormRevision)
  }

  async save(revision: Revision): Promise<Revision> {
    const typeormRevision = this.revisionMapper.toProjection(revision)

    await this.ormRepository.save(typeormRevision)

    return revision
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

    const simplifiedRevisions = await queryBuilder.getMany()

    const metadata = []
    for (const simplifiedRevision of simplifiedRevisions) {
      metadata.push(this.revisionMetadataMapper.toDomain(simplifiedRevision))
    }

    return metadata
  }
}
