import {
  SharedSubscriptionInvitationCanceledEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

@injectable()
export class SharedSubscriptionInvitationCanceledEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.Files_MarkFilesToBeRemoved) private markFilesToBeRemoved: MarkFilesToBeRemoved,
    @inject(TYPES.Files_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Files_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async handle(event: SharedSubscriptionInvitationCanceledEvent): Promise<void> {
    if (event.payload.inviteeIdentifierType !== 'uuid') {
      return
    }

    const response = await this.markFilesToBeRemoved.execute({
      ownerUuid: event.payload.inviteeIdentifier,
    })

    if (!response.success) {
      return
    }

    for (const fileRemoved of response.filesRemoved) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileRemovedEvent({
          regularSubscriptionUuid: event.payload.inviterSubscriptionUuid,
          ...fileRemoved,
        }),
      )
    }
  }
}
