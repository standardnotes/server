import {
  SharedSubscriptionInvitationCanceledEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

export class SharedSubscriptionInvitationCanceledEventHandler implements DomainEventHandlerInterface {
  constructor(
    private markFilesToBeRemoved: MarkFilesToBeRemoved,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: SharedSubscriptionInvitationCanceledEvent): Promise<void> {
    if (event.payload.inviteeIdentifierType !== 'uuid') {
      return
    }

    const result = await this.markFilesToBeRemoved.execute({
      ownerUuid: event.payload.inviteeIdentifier,
    })

    if (result.isFailed()) {
      this.logger.error(
        `Could not mark files to be removed for invitee: ${event.payload.inviteeIdentifier}: ${result.getError()}`,
      )

      return
    }

    const filesRemoved = result.getValue()

    this.logger.debug(`Marked ${filesRemoved.length} files for removal for invitee ${event.payload.inviteeIdentifier}`)

    for (const fileRemoved of filesRemoved) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileRemovedEvent({
          regularSubscriptionUuid: event.payload.inviterSubscriptionUuid,
          userUuid: fileRemoved.userOrSharedVaultUuid,
          filePath: fileRemoved.filePath,
          fileName: fileRemoved.fileName,
          fileByteSize: fileRemoved.fileByteSize,
        }),
      )
    }
  }
}
