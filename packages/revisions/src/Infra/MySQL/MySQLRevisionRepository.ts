import { MapperInterface, RevisionMetadata, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'
import { TypeORMRevision } from '../TypeORM/TypeORMRevision'

export class MySQLRevisionRepository implements RevisionRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMRevision>,
    private revisionMapper: MapperInterface<RevisionMetadata, TypeORMRevision>,
  ) {}

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
      metadata.push(this.revisionMapper.toDomain(simplifiedRevision))
    }

    return metadata
  }
}
