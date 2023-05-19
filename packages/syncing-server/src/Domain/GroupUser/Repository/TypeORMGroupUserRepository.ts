import { GroupUser } from '../Model/GroupUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  GroupUserFindAllForGroup,
  GroupUserFindAllForUserQuery,
  GroupUserRepositoryInterface,
} from './GroupUserRepositoryInterface'

export class TypeORMGroupUserRepository implements GroupUserRepositoryInterface {
  constructor(private ormRepository: Repository<GroupUser>) {}

  async create(groupUser: GroupUser): Promise<GroupUser> {
    return this.ormRepository.save(groupUser)
  }

  async save(groupUser: GroupUser): Promise<GroupUser> {
    return this.ormRepository.save(groupUser)
  }

  findByUuid(uuid: string): Promise<GroupUser | null> {
    return this.ormRepository
      .createQueryBuilder('group_user')
      .where('group_user.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<GroupUser | null> {
    return this.ormRepository
      .createQueryBuilder('group_user')
      .where('group_user.user_uuid = :userUuid', { userUuid })
      .andWhere('group_user.group_uuid = :groupUuid', { groupUuid })
      .getOne()
  }

  async remove(groupUser: GroupUser): Promise<GroupUser> {
    return this.ormRepository.remove(groupUser)
  }

  findAllForGroup(query: GroupUserFindAllForGroup): Promise<GroupUser[]> {
    return this.ormRepository
      .createQueryBuilder('group_user')
      .where('group_user.group_uuid = :groupUuid', { groupUuid: query.groupUuid })
      .getMany()
  }

  async findAllForUser(query: GroupUserFindAllForUserQuery): Promise<GroupUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: GroupUserFindAllForUserQuery): SelectQueryBuilder<GroupUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('group_user')

    queryBuilder.where('group_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    if (query.includeSentAndReceived) {
      queryBuilder.orWhere('group_user.sender_uuid = :userUuid', { userUuid: query.userUuid })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('group_user.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    return queryBuilder
  }
}
