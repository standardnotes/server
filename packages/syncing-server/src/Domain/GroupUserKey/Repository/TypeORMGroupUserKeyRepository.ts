import { GroupUserKey } from '../Model/GroupUserKey'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { GroupUserKeyQuery } from './GroupUserKeyRepositoryInterface'

export class TypeORMGroupUserKeyRepository {
  constructor(private ormRepository: Repository<GroupUserKey>) {}

  async create(group: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.save(group)
  }

  findByUuid(uuid: string): Promise<GroupUserKey | null> {
    return this.ormRepository
      .createQueryBuilder('group_user')
      .where('group_user.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async remove(group: GroupUserKey): Promise<GroupUserKey> {
    return this.ormRepository.remove(group)
  }

  async findAll(query: GroupUserKeyQuery): Promise<GroupUserKey[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: GroupUserKeyQuery): SelectQueryBuilder<GroupUserKey> {
    const queryBuilder = this.ormRepository.createQueryBuilder('group_user')

    queryBuilder.where('group_user.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}
