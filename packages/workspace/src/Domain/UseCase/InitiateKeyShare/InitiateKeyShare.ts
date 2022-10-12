import { WorkspaceAccessLevel, WorkspaceUserStatus } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { WorkspaceUserRepositoryInterface } from '../../Workspace/WorkspaceUserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { InitiateKeyShareDTO } from './InitiateKeyShareDTO'
import { InitiateKeyShareResponse } from './InitiateKeyShareResponse'

@injectable()
export class InitiateKeyShare implements UseCaseInterface {
  constructor(
    @inject(TYPES.WorkspaceUserRepository) private workspaceUserRepository: WorkspaceUserRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: InitiateKeyShareDTO): Promise<InitiateKeyShareResponse> {
    const workspaceOwner = await this.workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid({
      workspaceUuid: dto.workspaceUuid,
      userUuid: dto.performingUserUuid,
    })
    if (
      workspaceOwner === null ||
      ![WorkspaceAccessLevel.Admin, WorkspaceAccessLevel.Owner].includes(workspaceOwner.accessLevel)
    ) {
      return {
        success: false,
      }
    }

    const workspaceUser = await this.workspaceUserRepository.findOneByUserUuidAndWorkspaceUuid({
      workspaceUuid: dto.workspaceUuid,
      userUuid: dto.userUuid,
    })

    if (workspaceUser === null) {
      return {
        success: false,
      }
    }

    workspaceUser.encryptedWorkspaceKey = dto.encryptedWorkspaceKey
    workspaceUser.status = WorkspaceUserStatus.Active
    workspaceUser.updatedAt = this.timer.getTimestampInMicroseconds()

    await this.workspaceUserRepository.save(workspaceUser)

    return {
      success: true,
    }
  }
}
