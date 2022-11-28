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

  async removeOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('revisions')
      .where('uuid = :revisionUuid AND user_uuid = :userUuid', { userUuid, revisionUuid })
      .execute()
  }

  async findOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<Revision | null> {
    const typeormRevision = await this.ormRepository
      .createQueryBuilder()
      .where('uuid = :revisionUuid', { revisionUuid })
      .andWhere('user_uuid = :userUuid', { userUuid })
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
      .where('item_uuid = :itemUuid', { itemUuid })
      .andWhere('user_uuid = :userUuid', { userUuid })
      .orderBy('created_at', 'DESC')

    const simplifiedRevisions = await queryBuilder.getMany()

    const metadata = []
    for (const simplifiedRevision of simplifiedRevisions) {
      metadata.push(this.revisionMetadataMapper.toDomain(simplifiedRevision))
    }

    return metadata
  }
}
