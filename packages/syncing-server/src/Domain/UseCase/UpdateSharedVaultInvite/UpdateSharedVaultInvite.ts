import { Result, Timestamps, UseCaseInterface, Uuid, Validator } from '@standardnotes/domain-core'

import { SharedVaultInviteRepositoryInterface } from '../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { UpdateSharedVaultInviteDTO } from './UpdateSharedVaultInviteDTO'
import { SharedVaultUserPermission } from '../../SharedVault/User/SharedVaultUserPermission'
import { TimerInterface } from '@standardnotes/time'

export class UpdateSharedVaultInvite implements UseCaseInterface<void> {
  constructor(
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: UpdateSharedVaultInviteDTO): Promise<Result<void>> {
    const inviteUuidOrError = Uuid.create(dto.inviteUuid)
    if (inviteUuidOrError.isFailed()) {
      return Result.fail(inviteUuidOrError.getError())
    }
    const inviteUuid = inviteUuidOrError.getValue()

    const senderUuidOrError = Uuid.create(dto.senderUuid)
    if (senderUuidOrError.isFailed()) {
      return Result.fail(senderUuidOrError.getError())
    }
    const senderUuid = senderUuidOrError.getValue()

    const emptyMessageValidation = Validator.isNotEmpty(dto.encryptedMessage)
    if (emptyMessageValidation.isFailed()) {
      return Result.fail(emptyMessageValidation.getError())
    }

    const invite = await this.sharedVaultInviteRepository.findByUuid(inviteUuid)
    if (!invite) {
      return Result.fail('Invite not found')
    }

    if (!invite.props.senderUuid.equals(senderUuid)) {
      return Result.fail('Only the sender can update the invite')
    }

    invite.props.encryptedMessage = dto.encryptedMessage

    if (dto.permission !== undefined) {
      const permissionOrError = SharedVaultUserPermission.create(dto.permission)
      if (permissionOrError.isFailed()) {
        return Result.fail(permissionOrError.getError())
      }
      const permission = permissionOrError.getValue()

      invite.props.permission = permission
    }

    invite.props.timestamps = Timestamps.create(
      invite.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    await this.sharedVaultInviteRepository.save(invite)

    return Result.ok()
  }
}
