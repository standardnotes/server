import { Result, SharedVaultUserPermission, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { InviteUserToSharedVaultDTO } from './InviteUserToSharedVaultDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'

export class InviteUserToSharedVault implements UseCaseInterface<SharedVaultInvite> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private timer: TimerInterface,
  ) {}
  async execute(dto: InviteUserToSharedVaultDTO): Promise<Result<SharedVaultInvite>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const senderUuidOrError = Uuid.create(dto.senderUuid)
    if (senderUuidOrError.isFailed()) {
      return Result.fail(senderUuidOrError.getError())
    }
    const senderUuid = senderUuidOrError.getValue()

    const recipientUuidOrError = Uuid.create(dto.recipientUuid)
    if (recipientUuidOrError.isFailed()) {
      return Result.fail(recipientUuidOrError.getError())
    }
    const recipientUuid = recipientUuidOrError.getValue()

    const permissionOrError = SharedVaultUserPermission.create(dto.permission)
    if (permissionOrError.isFailed()) {
      return Result.fail(permissionOrError.getError())
    }
    const permission = permissionOrError.getValue()

    const sharedVault = await this.sharedVaultRepository.findByUuid(sharedVaultUuid)
    if (!sharedVault) {
      return Result.fail('Attempting to invite a user to a non-existent shared vault')
    }

    if (sharedVault.props.userUuid.value !== senderUuid.value) {
      return Result.fail('Only the owner of a shared vault can invite users to it')
    }

    const existingInvite = await this.sharedVaultInviteRepository.findByUserUuidAndSharedVaultUuid({
      userUuid: recipientUuid,
      sharedVaultUuid,
    })
    if (existingInvite) {
      await this.sharedVaultInviteRepository.remove(existingInvite)
    }

    const sharedVaultInviteOrError = SharedVaultInvite.create({
      encryptedMessage: dto.encryptedMessage,
      userUuid: recipientUuid,
      sharedVaultUuid,
      senderUuid,
      permission,
      timestamps: Timestamps.create(
        this.timer.getTimestampInMicroseconds(),
        this.timer.getTimestampInMicroseconds(),
      ).getValue(),
    })
    if (sharedVaultInviteOrError.isFailed()) {
      return Result.fail(sharedVaultInviteOrError.getError())
    }
    const sharedVaultInvite = sharedVaultInviteOrError.getValue()

    await this.sharedVaultInviteRepository.save(sharedVaultInvite)

    return Result.ok(sharedVaultInvite)
  }
}
