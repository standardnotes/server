import { GroupUser } from './../Model/GroupUser'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { GroupUserQuery } from './GroupUserQuery'

export class TypeORMGroupUserRepository {
  constructor(private ormRepository: Repository<GroupUser>) {}

  findByUuid(uuid: string): Promise<GroupUser | null> {
    return this.ormRepository
      .createQueryBuilder('group_user')
      .where('group_user.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async create(group: GroupUser): Promise<GroupUser> {
    return this.ormRepository.save(group)
  }

  async remove(group: GroupUser): Promise<GroupUser> {
    return this.ormRepository.remove(group)
  }

  async findAll(query: GroupUserQuery): Promise<GroupUser[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: GroupUserQuery): SelectQueryBuilder<GroupUser> {
    const queryBuilder = this.ormRepository.createQueryBuilder('group_user')

    queryBuilder.where('group_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}
