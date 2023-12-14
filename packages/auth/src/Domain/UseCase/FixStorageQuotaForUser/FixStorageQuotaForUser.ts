import { Result, SettingName, UseCaseInterface, Username } from '@standardnotes/domain-core'

import { FixStorageQuotaForUserDTO } from './FixStorageQuotaForUserDTO'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { SetSubscriptionSettingValue } from '../SetSubscriptionSettingValue/SetSubscriptionSettingValue'
import { ListSharedSubscriptionInvitations } from '../ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { GetSharedSubscriptionForUser } from '../GetSharedSubscriptionForUser/GetSharedSubscriptionForUser'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

export class FixStorageQuotaForUser implements UseCaseInterface<void> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getRegularSubscription: GetRegularSubscriptionForUser,
    private getSharedSubscriptionForUser: GetSharedSubscriptionForUser,
    private setSubscriptonSettingValue: SetSubscriptionSettingValue,
    private listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations,
    private domainEventFactory: DomainEventFactoryInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private logger: Logger,
  ) {}

  async execute(dto: FixStorageQuotaForUserDTO): Promise<Result<void>> {
    const usernameOrError = Username.create(dto.userEmail)
    if (usernameOrError.isFailed()) {
      return Result.fail(usernameOrError.getError())
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    if (user === null) {
      return Result.fail(`Could not find user with email: ${username.value}`)
    }

    const regularSubscriptionOrError = await this.getRegularSubscription.execute({
      userUuid: user.uuid,
    })
    if (regularSubscriptionOrError.isFailed()) {
      return Result.fail(`Could not find regular user subscription for user with uuid: ${user.uuid}`)
    }
    const regularSubscription = regularSubscriptionOrError.getValue()

    const result = await this.setSubscriptonSettingValue.execute({
      userSubscriptionUuid: regularSubscription.uuid,
      settingName: SettingName.NAMES.FileUploadBytesUsed,
      value: '0',
    })
    if (result.isFailed()) {
      return Result.fail(result.getError())
    }

    this.logger.info('Resetted storage quota for user', {
      userId: user.uuid,
    })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createFileQuotaRecalculationRequestedEvent({
        userUuid: user.uuid,
      }),
    )

    this.logger.info('Requested storage quota recalculation for user', {
      userId: user.uuid,
    })

    const invitationsResult = await this.listSharedSubscriptionInvitations.execute({
      inviterEmail: user.email,
    })
    const acceptedInvitations = invitationsResult.invitations.filter(
      (invitation) => invitation.status === InvitationStatus.Accepted,
    )
    for (const invitation of acceptedInvitations) {
      const inviteeUsernameOrError = Username.create(invitation.inviteeIdentifier)
      if (inviteeUsernameOrError.isFailed()) {
        return Result.fail(inviteeUsernameOrError.getError())
      }
      const inviteeUsername = inviteeUsernameOrError.getValue()

      const invitee = await this.userRepository.findOneByUsernameOrEmail(inviteeUsername)
      if (invitee === null) {
        return Result.fail(`Could not find user with email: ${inviteeUsername.value}`)
      }

      const invitationSubscriptionOrError = await this.getSharedSubscriptionForUser.execute({
        userUuid: invitee.uuid,
      })
      if (invitationSubscriptionOrError.isFailed()) {
        return Result.fail(`Could not find shared subscription for user with email: ${invitation.inviteeIdentifier}`)
      }
      const invitationSubscription = invitationSubscriptionOrError.getValue()

      const result = await this.setSubscriptonSettingValue.execute({
        userSubscriptionUuid: invitationSubscription.uuid,
        settingName: SettingName.NAMES.FileUploadBytesUsed,
        value: '0',
      })
      if (result.isFailed()) {
        return Result.fail(result.getError())
      }

      this.logger.info('Resetted storage quota for user', {
        userId: invitee.uuid,
      })

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileQuotaRecalculationRequestedEvent({
          userUuid: invitee.uuid,
        }),
      )

      this.logger.info('Requested storage quota recalculation for user', {
        userId: invitee.uuid,
      })
    }

    return Result.ok()
  }
}
