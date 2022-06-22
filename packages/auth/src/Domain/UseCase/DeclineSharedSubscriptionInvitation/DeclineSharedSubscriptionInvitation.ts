import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { InvitationStatus } from '../../SharedSubscription/InvitationStatus'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'

import { DeclineSharedSubscriptionInvitationDTO } from './DeclineSharedSubscriptionInvitationDTO'
import { DeclineSharedSubscriptionInvitationResponse } from './DeclineSharedSubscriptionInvitationResponse'

@injectable()
export class DeclineSharedSubscriptionInvitation implements UseCaseInterface {
  constructor(
    @inject(TYPES.SharedSubscriptionInvitationRepository)
    private sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: DeclineSharedSubscriptionInvitationDTO): Promise<DeclineSharedSubscriptionInvitationResponse> {
    const sharedSubscriptionInvitation = await this.sharedSubscriptionInvitationRepository.findOneByUuidAndStatus(
      dto.sharedSubscriptionInvitationUuid,
      InvitationStatus.Sent,
    )
    if (sharedSubscriptionInvitation === null) {
      return {
        success: false,
      }
    }

    sharedSubscriptionInvitation.status = InvitationStatus.Declined
    sharedSubscriptionInvitation.updatedAt = this.timer.getTimestampInMicroseconds()

    await this.sharedSubscriptionInvitationRepository.save(sharedSubscriptionInvitation)

    return {
      success: true,
    }
  }
}
