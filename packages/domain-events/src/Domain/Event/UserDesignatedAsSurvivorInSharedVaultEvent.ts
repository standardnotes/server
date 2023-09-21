import { DomainEventInterface } from './DomainEventInterface'
import { UserDesignatedAsSurvivorInSharedVaultEventPayload } from './UserDesignatedAsSurvivorInSharedVaultEventPayload'

export interface UserDesignatedAsSurvivorInSharedVaultEvent extends DomainEventInterface {
  type: 'USER_DESIGNATED_AS_SURVIVOR_IN_SHARED_VAULT'
  payload: UserDesignatedAsSurvivorInSharedVaultEventPayload
}
