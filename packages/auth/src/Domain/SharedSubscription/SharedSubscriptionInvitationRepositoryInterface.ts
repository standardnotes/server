import { InvitationStatus } from './InvitationStatus'
import { SharedSubscriptionInvitation } from './SharedSubscriptionInvitation'

export interface SharedSubscriptionInvitationRepositoryInterface {
  save(sharedSubscriptionInvitation: SharedSubscriptionInvitation): Promise<SharedSubscriptionInvitation>
  findOneByUuidAndStatus(uuid: string, status: InvitationStatus): Promise<SharedSubscriptionInvitation | null>
  findOneByUuid(uuid: string): Promise<SharedSubscriptionInvitation | null>
  findByInviterEmail(inviterEmail: string): Promise<SharedSubscriptionInvitation[]>
  findOneByInviteeAndInviterEmail(
    inviteeEmail: string,
    inviterEmail: string,
  ): Promise<SharedSubscriptionInvitation | null>
  countByInviterEmailAndStatus(inviterEmail: string, statuses: InvitationStatus[]): Promise<number>
}
