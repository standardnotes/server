import { Result, SharedVaultUserPermission, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SharedVaultInvite } from '../../../SharedVault/User/Invite/SharedVaultInvite'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { InviteUserToSharedVaultDTO } from './InviteUserToSharedVaultDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { Logger } from 'winston'
import { DomainEventFactoryInterface } from '../../../Event/DomainEventFactoryInterface'
import { SendEventToClient } from '../../Syncing/SendEventToClient/SendEventToClient'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

export class InviteUserToSharedVault implements UseCaseInterface<SharedVaultInvite> {
  constructor(
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private timer: TimerInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private sendEventToClientUseCase: SendEventToClient,
    private logger: Logger,
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

    const alreadyExistingMember = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid({
      userUuid: recipientUuid,
      sharedVaultUuid,
    })
    if (alreadyExistingMember) {
      return Result.fail('User is already a member of this shared vault')
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

    const event = this.domainEventFactory.createUserInvitedToSharedVaultEvent({
      invite: {
        uuid: sharedVaultInvite.id.toString(),
        shared_vault_uuid: sharedVaultInvite.props.sharedVaultUuid.value,
        user_uuid: sharedVaultInvite.props.userUuid.value,
        sender_uuid: sharedVaultInvite.props.senderUuid.value,
        encrypted_message: sharedVaultInvite.props.encryptedMessage,
        permission: sharedVaultInvite.props.permission.value,
        created_at_timestamp: sharedVaultInvite.props.timestamps.createdAt,
        updated_at_timestamp: sharedVaultInvite.props.timestamps.updatedAt,
      },
    })

    await this.domainEventPublisher.publish(event)

    const result = await this.sendEventToClientUseCase.execute({
      userUuid: sharedVaultInvite.props.userUuid.value,
      event,
    })
    if (result.isFailed()) {
      this.logger.error(
        `Failed to send user invited to shared vault event to client for user ${
          sharedVaultInvite.props.userUuid.value
        }: ${result.getError()}`,
      )
    }

    return Result.ok(sharedVaultInvite)
  }
}
