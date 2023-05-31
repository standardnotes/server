import { TimerInterface } from '@standardnotes/time'
import { RemovedGroupUser } from '../Model/RemovedGroupUser'
import { RemovedGroupUserFactoryInterface } from '../Factory/RemovedGroupUserFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { RemovedGroupUserRepositoryInterface } from '../Repository/RemovedGroupUserRepositoryInterface'
import { RemovedGroupUserServiceInterface } from './RemovedGroupUserServiceInterface'
import { GetRemovedGroupUsersDTO } from './GetRemovedGroupUsersDTO'
import { GroupsRepositoryInterface } from '../../Group/Repository/GroupRepositoryInterface'

export class RemovedGroupUserService implements RemovedGroupUserServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private removedGroupUserRepository: RemovedGroupUserRepositoryInterface,
    private removedGroupUserFactory: RemovedGroupUserFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async addRemovedGroupUser(dto: {
    groupUuid: string
    userUuid: string
    removedBy: string
  }): Promise<RemovedGroupUser | null> {
    const group = await this.groupRepository.findByUuid(dto.groupUuid)
    if (!group) {
      return null
    }

    const timestamp = this.timer.getTimestampInMicroseconds()
    const removedGroupUser = this.removedGroupUserFactory.create({
      uuid: uuidv4(),
      user_uuid: dto.userUuid,
      group_uuid: dto.groupUuid,
      removed_by: dto.removedBy,
      created_at_timestamp: timestamp,
      updated_at_timestamp: timestamp,
    })

    return this.removedGroupUserRepository.create(removedGroupUser)
  }

  getAllRemovedGroupUsersForUser(dto: GetRemovedGroupUsersDTO): Promise<RemovedGroupUser[]> {
    return this.removedGroupUserRepository.findAllForUser(dto)
  }

  async deleteRemovedGroupUser(dto: { groupUuid: string; userUuid: string }): Promise<boolean> {
    const removedGroupUser = await this.removedGroupUserRepository.findByUserUuidAndGroupUuid(
      dto.userUuid,
      dto.groupUuid,
    )
    if (!removedGroupUser) {
      return false
    }

    await this.removedGroupUserRepository.remove(removedGroupUser)

    return true
  }
}
