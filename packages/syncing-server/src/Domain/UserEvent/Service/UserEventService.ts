import { TimerInterface } from '@standardnotes/time'
import { UserEvent } from '../Model/UserEvent'
import { UserEventsRepositoryInterface } from '../Repository/UserEventRepositoryInterface'
import { CreateUserEventDTO, UserEventServiceInterface } from './UserEventServiceInterface'
import { UserEventFactoryInterface } from '../Factory/UserEventFactoryInterface'
import { v4 as uuidv4 } from 'uuid'
import { UserEventType } from '../Model/UserEventType'
import { UserEventPayloadV1 } from '../Model/UserEventPayload'

export class UserEventService implements UserEventServiceInterface {
  constructor(
    private userEventRepository: UserEventsRepositoryInterface,
    private userEventFactory: UserEventFactoryInterface,
    private timer: TimerInterface,
  ) {}

  async removeUserEventsAfterUserIsAddedToSharedVault(params: {
    userUuid: string
    sharedVaultUuid: string
  }): Promise<void> {
    const events = await this.findEvents({
      userUuid: params.userUuid,
      eventType: UserEventType.RemovedFromSharedVault,
    })

    await this.deleteUserEvents(events)
  }

  async removeUserEventsAfterItemIsAddedToSharedVault(params: {
    userUuid: string
    sharedVaultUuid: string
    itemUuid: string
  }): Promise<void> {
    const events = await this.findEvents({
      userUuid: params.userUuid,
      eventType: UserEventType.SharedVaultItemRemoved,
    })

    await this.deleteUserEvents(events)
  }

  async createUserRemovedFromSharedVaultUserEvent(params: {
    userUuid: string
    sharedVaultUuid: string
  }): Promise<UserEvent> {
    return this.createUserEvent({
      userUuid: params.userUuid,
      eventPayload: {
        sharedVaultUuid: params.sharedVaultUuid,
        eventType: UserEventType.RemovedFromSharedVault,
        version: UserEventPayloadV1,
      },
    })
  }

  async createItemRemovedFromSharedVaultUserEvent(params: {
    userUuid: string
    sharedVaultUuid: string
    itemUuid: string
  }): Promise<UserEvent> {
    return this.createUserEvent({
      userUuid: params.userUuid,
      eventPayload: {
        eventType: UserEventType.SharedVaultItemRemoved,
        sharedVaultUuid: params.sharedVaultUuid,
        itemUuid: params.itemUuid,
        version: UserEventPayloadV1,
      },
    })
  }

  async getUserEvents(dto: { userUuid: string; lastSyncTime?: number }): Promise<UserEvent[]> {
    const userEvents = await this.userEventRepository.findAll({
      userUuid: dto.userUuid,
      lastSyncTime: dto.lastSyncTime,
    })

    return userEvents
  }

  private async createUserEvent(dto: CreateUserEventDTO): Promise<UserEvent> {
    const timestamp = this.timer.getTimestampInMicroseconds()
    const userEvent = this.userEventFactory.create({
      userUuid: dto.userUuid,
      userEventHash: {
        uuid: uuidv4(),
        user_uuid: dto.userUuid,
        event_type: dto.eventPayload.eventType,
        event_payload: dto.eventPayload,
        created_at_timestamp: timestamp,
        updated_at_timestamp: timestamp,
      },
    })

    const savedUserEvent = await this.userEventRepository.create(userEvent)

    return savedUserEvent
  }

  private async findEvents(dto: { userUuid: string; eventType: UserEventType }): Promise<UserEvent[]> {
    const userEvents = await this.userEventRepository.findAll({
      userUuid: dto.userUuid,
      eventType: dto.eventType,
    })

    return userEvents
  }

  private async deleteUserEvents(events: UserEvent[]): Promise<void> {
    for (const event of events) {
      await this.userEventRepository.remove(event)
    }
  }
}
