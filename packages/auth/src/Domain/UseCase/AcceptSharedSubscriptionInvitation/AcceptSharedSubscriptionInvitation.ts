import { SubscriptionName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'
import { UserSubscriptionType } from '../../Subscription/UserSubscriptionType'
import { User } from '../../User/User'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { AcceptSharedSubscriptionInvitationDTO } from './AcceptSharedSubscriptionInvitationDTO'
import { AcceptSharedSubscriptionInvitationResponse } from './AcceptSharedSubscriptionInvitationResponse'

@injectable()
export class AcceptSharedSubscriptionInvitation implements UseCaseInterface {
  constructor(
    @inject(TYPES.SharedSubscriptionInvitationRepository)
    private sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.UserSubscriptionRepository) private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
    @inject(TYPES.RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.SubscriptionSettingService) private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: AcceptSharedSubscriptionInvitationDTO): Promise<AcceptSharedSubscriptionInvitationResponse> {
    const sharedSubscriptionInvitation = await this.sharedSubscriptionInvitationRepository.findOneByUuidAndStatus(
      dto.sharedSubscriptionInvitationUuid,
      InvitationStatus.Sent,
    )
    if (sharedSubscriptionInvitation === null) {
      return {
        success: false,
        message: 'Could not find the subscription invitation. It may have been already accepted or declined.',
      }
    }

    const invitee = await this.userRepository.findOneByEmail(sharedSubscriptionInvitation.inviteeIdentifier)
    if (invitee === null) {
      return {
        success: false,
        message:
          'Could not find the invitee in our user database. Please first register an account before accepting the invitation.',
      }
    }

    const inviterUserSubscriptions = await this.userSubscriptionRepository.findBySubscriptionIdAndType(
      sharedSubscriptionInvitation.subscriptionId,
      UserSubscriptionType.Regular,
    )
    const timestamp = this.timer.getTimestampInMicroseconds()
    const activeUserSubscriptions = inviterUserSubscriptions.filter((userSubscription: UserSubscription) => {
      return userSubscription.endsAt >= timestamp
    })
    if (activeUserSubscriptions.length === 0) {
      return {
        success: false,
        message: 'The person that invited you does not have a running subscription with Standard Notes anymore.',
      }
    }
    const inviterUserSubscription = activeUserSubscriptions[0]

    sharedSubscriptionInvitation.status = InvitationStatus.Accepted
    sharedSubscriptionInvitation.updatedAt = this.timer.getTimestampInMicroseconds()

    await this.sharedSubscriptionInvitationRepository.save(sharedSubscriptionInvitation)

    const inviteeSubscription = await this.createSharedSubscription(
      sharedSubscriptionInvitation.subscriptionId,
      inviterUserSubscription.planName,
      invitee,
      inviterUserSubscription.endsAt,
    )

    await this.addUserRole(invitee, inviterUserSubscription.planName as SubscriptionName)

    await this.subscriptionSettingService.applyDefaultSubscriptionSettingsForSubscription(
      inviteeSubscription,
      inviteeSubscription.planName as SubscriptionName,
      invitee.uuid,
    )

    return {
      success: true,
    }
  }

  private async addUserRole(user: User, subscriptionName: SubscriptionName): Promise<void> {
    await this.roleService.addUserRole(user, subscriptionName)
  }

  private async createSharedSubscription(
    subscriptionId: number,
    subscriptionName: string,
    user: User,
    subscriptionExpiresAt: number,
  ): Promise<UserSubscription> {
    const subscription = new UserSubscription()
    subscription.planName = subscriptionName
    subscription.user = Promise.resolve(user)
    const timestamp = this.timer.getTimestampInMicroseconds()
    subscription.createdAt = timestamp
    subscription.updatedAt = timestamp
    subscription.endsAt = subscriptionExpiresAt
    subscription.cancelled = false
    subscription.subscriptionId = subscriptionId
    subscription.subscriptionType = UserSubscriptionType.Shared

    return this.userSubscriptionRepository.save(subscription)
  }
}
