import {
  AccountDeletionRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Files_MarkFilesToBeRemoved) private markFilesToBeRemoved: MarkFilesToBeRemoved,
    @inject(TYPES.Files_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Files_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    if (event.payload.regularSubscriptionUuid === undefined) {
      return
    }

    const result = await this.markFilesToBeRemoved.execute({
      ownerUuid: event.payload.userUuid,
    })

    if (result.isFailed()) {
      return
    }

    const filesRemoved = result.getValue()

    for (const fileRemoved of filesRemoved) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileRemovedEvent({
          regularSubscriptionUuid: event.payload.regularSubscriptionUuid,
          ...fileRemoved,
        }),
      )
    }
  }
}
