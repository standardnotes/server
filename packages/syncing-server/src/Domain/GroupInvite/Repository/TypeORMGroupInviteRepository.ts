import { GroupInvite } from '../Model/GroupInvite'
import { Repository, SelectQueryBuilder } from 'typeorm'
import {
  GroupInviteFindAllForGroup,
  GroupInviteFindAllForUserQuery,
  GroupInviteRepositoryInterface,
} from './GroupInviteRepositoryInterface'

export class TypeORMGroupInviteRepository implements GroupInviteRepositoryInterface {
  constructor(private ormRepository: Repository<GroupInvite>) {}

  async create(groupInvite: GroupInvite): Promise<GroupInvite> {
    return this.ormRepository.save(groupInvite)
  }

  async save(groupInvite: GroupInvite): Promise<GroupInvite> {
    return this.ormRepository.save(groupInvite)
  }

  findByUuid(uuid: string): Promise<GroupInvite | null> {
    return this.ormRepository
      .createQueryBuilder('group_invite')
      .where('group_invite.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  findByUserUuidAndGroupUuid(userUuid: string, groupUuid: string): Promise<GroupInvite | null> {
    return this.ormRepository
      .createQueryBuilder('group_invite')
      .where('group_invite.user_uuid = :userUuid', { userUuid })
      .andWhere('group_invite.group_uuid = :groupUuid', { groupUuid })
      .getOne()
  }

  async remove(groupInvite: GroupInvite): Promise<GroupInvite> {
    return this.ormRepository.remove(groupInvite)
  }

  findAllForGroup(query: GroupInviteFindAllForGroup): Promise<GroupInvite[]> {
    return this.ormRepository
      .createQueryBuilder('group_invite')
      .where('group_invite.group_uuid = :groupUuid', { groupUuid: query.groupUuid })
      .getMany()
  }

  async findAllForUser(query: GroupInviteFindAllForUserQuery): Promise<GroupInvite[]> {
    return this.createFindAllQueryBuilder(query).getMany()
  }

  private createFindAllQueryBuilder(query: GroupInviteFindAllForUserQuery): SelectQueryBuilder<GroupInvite> {
    const queryBuilder = this.ormRepository.createQueryBuilder('group_invite')

    queryBuilder.where('group_invite.user_uuid = :userUuid', { userUuid: query.userUuid })

    if (query.includeSentAndReceived) {
      queryBuilder.orWhere('group_invite.sender_uuid = :userUuid', { userUuid: query.userUuid })
    }

    if (query.lastSyncTime) {
      queryBuilder.andWhere('group_invite.updated_at_timestamp > :lastSyncTime', {
        lastSyncTime: query.lastSyncTime,
      })
    }

    if (query.inviterUuid) {
      queryBuilder.andWhere('group_invite.inviter_uuid = :inviterUuid', {
        inviterUuid: query.inviterUuid,
      })
    }

    return queryBuilder
  }
}
