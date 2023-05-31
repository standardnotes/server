import { RemovedGroupUser } from '../Model/RemovedGroupUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  RemovedGroupUserFindAllForUserQuery,
  RemovedGroupUserRepositoryInterface,
} from './RemovedGroupUserRepositoryInterface'

export class TypeORMRemovedGroupUserRepository implements RemovedGroupUserRepositoryInterface {
  constructor(private ormRepository: Repository<RemovedGroupUser>) {}

  async create(removedGroupUser: RemovedGroupUser): Promise<RemovedGroupUser> {
    return this.ormRepository.save(removedGroupUser)
  }

  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<RemovedGroupUser | null> {
    return this.ormRepository
      .createQueryBuilder('removed_group_user')
      .where('removed_group_user.user_uuid = :userUuid', { userUuid })
      .andWhere('removed_group_user.group_uuid = :groupUuid', { groupUuid })
      .getOne()
  }

  async remove(removedGroupUser: RemovedGroupUser): Promise<RemovedGroupUser> {
    return this.ormRepository.remove(removedGroupUser)
  }

  async findAllForUser(query: RemovedGroupUserFindAllForUserQuery): Promise<RemovedGroupUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: RemovedGroupUserFindAllForUserQuery): SelectQueryBuilder<RemovedGroupUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('removed_group_user')

    queryBuilder.where('removed_group_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}
