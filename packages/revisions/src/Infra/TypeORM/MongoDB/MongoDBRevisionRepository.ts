import { MapperInterface, Uuid } from '@standardnotes/domain-core'
import { MongoRepository } from 'typeorm'
import { BSON } from 'mongodb'
import { Logger } from 'winston'

import { MongoDBRevision } from './MongoDBRevision'
import { Revision } from '../../../Domain/Revision/Revision'
import { RevisionMetadata } from '../../../Domain/Revision/RevisionMetadata'
import { RevisionRepositoryInterface } from '../../../Domain/Revision/RevisionRepositoryInterface'

export class MongoDBRevisionRepository implements RevisionRepositoryInterface {
  constructor(
    private mongoRepository: MongoRepository<MongoDBRevision>,
    private revisionMetadataMapper: MapperInterface<RevisionMetadata, MongoDBRevision>,
    private revisionMapper: MapperInterface<Revision, MongoDBRevision>,
    private logger: Logger,
  ) {}

  async countByUserUuid(userUuid: Uuid): Promise<number> {
    return this.mongoRepository.count({ userUuid: { $eq: userUuid.value } })
  }

  async findByUserUuid(dto: { userUuid: Uuid; offset?: number; limit?: number }): Promise<Revision[]> {
    const mongoRevisions = await this.mongoRepository.find({
      where: { userUuid: { $eq: dto.userUuid.value } },
      order: {
        createdAt: 'ASC',
      },
      skip: dto.offset,
      take: dto.limit,
    })

    const revisions = []
    for (const mongoRevision of mongoRevisions) {
      revisions.push(this.revisionMapper.toDomain(mongoRevision))
    }

    return revisions
  }

  async removeByUserUuid(userUuid: Uuid): Promise<void> {
    await this.mongoRepository.deleteMany({ where: { userUuid: userUuid.value } })
  }

  async removeOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<void> {
    await this.mongoRepository.deleteOne({
      where: {
        $and: [
          { _id: { $eq: BSON.UUID.createFromHexString(revisionUuid.value) } },
          { userUuid: { $eq: userUuid.value } },
        ],
      },
    })
  }

  async findOneByUuid(revisionUuid: Uuid, userUuid: Uuid): Promise<Revision | null> {
    const persistence = await this.mongoRepository.findOne({
      where: {
        $and: [
          { _id: { $eq: BSON.UUID.createFromHexString(revisionUuid.value) } },
          { userUuid: { $eq: userUuid.value } },
        ],
      },
    })

    if (persistence === null) {
      return null
    }

    return this.revisionMapper.toDomain(persistence)
  }

  async findByItemUuid(itemUuid: Uuid): Promise<Revision[]> {
    const persistence = await this.mongoRepository.find({
      where: {
        itemUuid: { $eq: itemUuid.value },
      },
    })

    const revisions: Revision[] = []

    for (const revision of persistence) {
      try {
        revisions.push(this.revisionMapper.toDomain(revision))
      } catch (error) {
        this.logger.error(`Failed to map revision ${revision._id.toHexString()} to domain: ${(error as Error).message}`)
      }
    }

    return revisions
  }

  async findMetadataByItemId(itemUuid: Uuid, userUuid: Uuid): Promise<RevisionMetadata[]> {
    const persistence = await this.mongoRepository.find({
      select: ['_id', 'contentType', 'createdAt', 'updatedAt'],
      where: {
        $and: [{ itemUuid: { $eq: itemUuid.value } }, { userUuid: { $eq: userUuid.value } }],
      },
      order: {
        createdAt: 'DESC',
      },
    })

    const revisions: RevisionMetadata[] = []

    for (const revision of persistence) {
      try {
        revisions.push(this.revisionMetadataMapper.toDomain(revision))
      } catch (error) {
        this.logger.error(`Failed to map revision ${revision._id.toHexString()} to domain: ${(error as Error).message}`)
      }
    }

    return revisions
  }

  async updateUserUuid(itemUuid: Uuid, userUuid: Uuid): Promise<void> {
    await this.mongoRepository.updateMany(
      {
        itemUuid: { $eq: itemUuid.value },
      },
      {
        $set: {
          userUuid: userUuid.value,
        },
      },
    )
  }

  async save(revision: Revision): Promise<Revision> {
    const persistence = this.revisionMapper.toProjection(revision)

    const { _id, ...rest } = persistence

    await this.mongoRepository.updateOne(
      { _id: { $eq: _id } },
      {
        $set: rest,
      },
      { upsert: true },
    )

    return revision
  }
}
