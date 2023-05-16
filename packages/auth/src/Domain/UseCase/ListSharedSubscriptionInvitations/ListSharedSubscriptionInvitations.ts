import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { SharedSubscriptionInvitationRepositoryInterface } from '../../SharedSubscription/SharedSubscriptionInvitationRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { ListSharedSubscriptionInvitationsDTO } from './ListSharedSubscriptionInvitationsDTO'
import { ListSharedSubscriptionInvitationsResponse } from './ListSharedSubscriptionInvitationsResponse'

@injectable()
export class ListSharedSubscriptionInvitations implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_SharedSubscriptionInvitationRepository)
    private sharedSubscriptionInvitationRepository: SharedSubscriptionInvitationRepositoryInterface,
  ) {}

  async execute(dto: ListSharedSubscriptionInvitationsDTO): Promise<ListSharedSubscriptionInvitationsResponse> {
    const invitations = await this.sharedSubscriptionInvitationRepository.findByInviterEmail(dto.inviterEmail)

    return {
      invitations,
    }
  }
}
