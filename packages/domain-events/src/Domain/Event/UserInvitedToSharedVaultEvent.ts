import { DomainEventInterface } from './DomainEventInterface'

import { UserInvitedToSharedVaultEventPayload } from './UserInvitedToSharedVaultEventPayload'

export interface UserInvitedToSharedVaultEvent extends DomainEventInterface {
  type: 'USER_INVITED_TO_SHARED_VAULT'
  payload: UserInvitedToSharedVaultEventPayload
}
