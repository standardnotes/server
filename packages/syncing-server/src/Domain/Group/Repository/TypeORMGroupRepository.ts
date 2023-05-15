import { Repository, SelectQueryBuilder } from 'typeorm'
import { GroupsRepositoryInterface, UserGroupsQuery } from './GroupRepositoryInterface'
import { Group } from '../Model/Group'

export class TypeORMGroupRepository implements GroupsRepositoryInterface {
  constructor(private ormRepository: Repository<Group>) {}

  findByUuid(uuid: string): Promise<Group | null> {
    return this.ormRepository
      .createQueryBuilder('group')
      .where('group.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async create(group: Group): Promise<Group> {
    return this.ormRepository.save(group)
  }

  async remove(group: Group): Promise<Group> {
    return this.ormRepository.remove(group)
  }

  async findAll(query: UserGroupsQuery): Promise<Group[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: UserGroupsQuery): SelectQueryBuilder<Group> {
    const queryBuilder = this.ormRepository.createQueryBuilder('group')

    queryBuilder.where('group.user_uuid = :userUuid', { userUuid: query.userUuid })

    return queryBuilder
  }
}
