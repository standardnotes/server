import { UserEvent } from '../Model/UserEvent'
import { UserEventPayload } from '../Model/UserEventPayload'

export type CreateUserEventDTO = {
  userUuid: string
  eventPayload: UserEventPayload
}

export interface UserEventServiceInterface {
  getUserEvents(dto: { userUuid: string; lastSyncTime?: number }): Promise<UserEvent[]>

  createUserRemovedFromSharedVaultUserEvent(params: { userUuid: string; sharedVaultUuid: string }): Promise<UserEvent>
  createItemRemovedFromSharedVaultUserEvent(params: {
    userUuid: string
    sharedVaultUuid: string
    itemUuid: string
  }): Promise<UserEvent>

  removeUserEventsAfterUserIsAddedToSharedVault(params: { userUuid: string; sharedVaultUuid: string }): Promise<void>
  removeUserEventsAfterItemIsAddedToSharedVault(params: {
    userUuid: string
    sharedVaultUuid: string
    itemUuid: string
  }): Promise<void>
}
