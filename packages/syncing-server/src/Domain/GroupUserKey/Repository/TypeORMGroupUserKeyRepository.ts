import { GroupUserKey } from '../Model/GroupUserKey'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  GroupUserKeyFindAllForGroup,
  GroupUserKeyFindAllForUserQuery,
  GroupUserKeyRepositoryInterface,
} from './GroupUserKeyRepositoryInterface'

export class TypeORMGroupUserKeyRepository implements GroupUserKeyRepositoryInterface {
  constructor(private ormRepository: Repository<GroupUserKey>) {}

  async create(groupUser: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.save(groupUser)
  }

  async save(groupUser: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.save(groupUser)
  }

  findByUuid(uuid: string): Promise<GroupUserKey | null> {
    return this.ormRepository
      .createQueryBuilder('group_user_key')
      .where('group_user_key.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<GroupUserKey | null> {
    return this.ormRepository
      .createQueryBuilder('group_user_key')
      .where('group_user_key.user_uuid = :userUuid', { userUuid })
      .andWhere('group_user_key.group_uuid = :groupUuid', { groupUuid })
      .getOne()
  }

  async remove(userKey: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.remove(userKey)
  }

  findAllForGroup(query: GroupUserKeyFindAllForGroup): Promise<GroupUserKey[]> {
    return this.ormRepository
      .createQueryBuilder('group_user_key')
      .where('group_user_key.group_uuid = :groupUuid', { groupUuid: query.groupUuid })
      .getMany()
  }

  async findAllForUser(query: GroupUserKeyFindAllForUserQuery): Promise<GroupUserKey[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: GroupUserKeyFindAllForUserQuery): SelectQueryBuilder<GroupUserKey> {
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
