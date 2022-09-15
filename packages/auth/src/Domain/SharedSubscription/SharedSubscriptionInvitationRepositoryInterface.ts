import { Uuid } from '@standardnotes/common'
import { InvitationStatus } from './InvitationStatus'
import { SharedSubscriptionInvitation } from './SharedSubscriptionInvitation'

export interface SharedSubscriptionInvitationRepositoryInterface {
  save(sharedSubscriptionInvitation: SharedSubscriptionInvitation): Promise<SharedSubscriptionInvitation>
  findOneByUuidAndStatus(uuid: Uuid, status: InvitationStatus): Promise<SharedSubscriptionInvitation | null>
  findOneByUuid(uuid: Uuid): Promise<SharedSubscriptionInvitation | null>
  findByInviterEmail(inviterEmail: string): Promise<SharedSubscriptionInvitation[]>
  findOneByInviteeAndInviterEmail(
    inviteeEmail: string,
    inviterEmail: string,
  ): Promise<SharedSubscriptionInvitation | null>
  countByInviterEmailAndStatus(inviterEmail: Uuid, statuses: InvitationStatus[]): Promise<number>
}
