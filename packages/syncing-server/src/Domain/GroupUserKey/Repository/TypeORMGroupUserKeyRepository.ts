import { GroupUserKey } from '../Model/GroupUserKey'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { GroupUserKeyFindAllQuery } from './GroupUserKeyRepositoryInterface'

export class TypeORMGroupUserKeyRepository {
  constructor(private ormRepository: Repository<GroupUserKey>) {}

  async create(group: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.save(group)
  }

  findByUuid(uuid: string): Promise<GroupUserKey | null> {
    return this.ormRepository
      .createQueryBuilder('group_user_key')
      .where('group_user_key.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(group: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.remove(group)
  }

  async findAll(query: GroupUserKeyFindAllQuery): Promise<GroupUserKey[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: GroupUserKeyFindAllQuery): SelectQueryBuilder<GroupUserKey> {
    const queryBuilder = this.ormRepository.createQueryBuilder('group_user_key')

    queryBuilder.where('group_user_key.user_uuid = :userUuid', { userUuid: query.userUuid })

    if (query.lastSyncTime) {
      queryBuilder.andWhere('group_user_key.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
