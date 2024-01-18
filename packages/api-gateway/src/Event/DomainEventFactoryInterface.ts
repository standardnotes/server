import { ContentSizesFixRequestedEvent } from '@standardnotes/domain-events'

export interface DomainEventFactoryInterface {
  createContentSizesFixRequestedEvent(dto: { userUuid: string }): ContentSizesFixRequestedEvent
}
