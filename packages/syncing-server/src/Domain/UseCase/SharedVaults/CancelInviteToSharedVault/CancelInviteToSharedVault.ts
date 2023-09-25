import {
  NotificationPayload,
  NotificationPayloadIdentifierType,
  NotificationType,
  Result,
  UseCaseInterface,
  Uuid,
} from '@standardnotes/domain-core'

import { CancelInviteToSharedVaultDTO } from './CancelInviteToSharedVaultDTO'
import { SharedVaultInviteRepositoryInterface } from '../../../SharedVault/User/Invite/SharedVaultInviteRepositoryInterface'
import { AddNotificationForUser } from '../../Messaging/AddNotificationForUser/AddNotificationForUser'

export class CancelInviteToSharedVault implements UseCaseInterface<void> {
  constructor(
    private sharedVaultInviteRepository: SharedVaultInviteRepositoryInterface,
    private addNotificationForUser: AddNotificationForUser,
  ) {}

  async execute(dto: CancelInviteToSharedVaultDTO): Promise<Result<void>> {
    const inviteUuidOrError = Uuid.create(dto.inviteUuid)
    if (inviteUuidOrError.isFailed()) {
      return Result.fail(inviteUuidOrError.getError())
    }
    const inviteUuid = inviteUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const invite = await this.sharedVaultInviteRepository.findByUuid(inviteUuid)
    if (!invite) {
      return Result.fail('Invite not found')
    }

    if (!invite.props.userUuid.equals(userUuid) && !invite.props.senderUuid.equals(userUuid)) {
      return Result.fail('Only the recipient or the sender can decline the invite')
    }

    await this.sharedVaultInviteRepository.remove(invite)

    const notificationPayloadOrError = NotificationPayload.create({
      primaryIdentifier: Uuid.create(invite.id.toString()).getValue(),
      primaryIndentifierType: NotificationPayloadIdentifierType.create(
        NotificationPayloadIdentifierType.TYPES.SharedVaultInviteUuid,
      ).getValue(),
      secondaryIdentifier: invite.props.sharedVaultUuid,
      secondaryIdentifierType: NotificationPayloadIdentifierType.create(
        NotificationPayloadIdentifierType.TYPES.SharedVaultUuid,
      ).getValue(),
      type: NotificationType.create(NotificationType.TYPES.SharedVaultInviteCanceled).getValue(),
      version: '1.0',
    })
    if (notificationPayloadOrError.isFailed()) {
      return Result.fail(notificationPayloadOrError.getError())
    }
    const notificationPayload = notificationPayloadOrError.getValue()

    const result = await this.addNotificationForUser.execute({
      userUuid: invite.props.userUuid.value,
      type: NotificationType.TYPES.SharedVaultInviteCanceled,
      payload: notificationPayload,
      version: '1.0',
    })
    if (result.isFailed()) {
      return Result.fail(result.getError())
    }

    return Result.ok()
  }
}
