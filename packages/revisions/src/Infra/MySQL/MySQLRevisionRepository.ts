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

  async save(revision: Revision): Promise<Revision> {
    const typeormRevision = this.revisionMapper.toProjection(revision)

    await this.ormRepository.save(typeormRevision)

    return revision
  }

  async findMetadataByItemId(itemUuid: Uuid): Promise<Array<RevisionMetadata>> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder()
      .select('uuid', 'uuid')
      .addSelect('content_type', 'contentType')
      .addSelect('created_at', 'createdAt')
      .addSelect('updated_at', 'updatedAt')
      .where('item_uuid = :item_uuid', {
        item_uuid: itemUuid,
      })
      .orderBy('created_at', 'DESC')

    const simplifiedRevisions = await queryBuilder.getMany()

    const metadata = []
    for (const simplifiedRevision of simplifiedRevisions) {
      metadata.push(this.revisionMetadataMapper.toDomain(simplifiedRevision))
    }

    return metadata
  }
}
