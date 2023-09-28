import {
  AccountDeletionRequestedEvent,
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private markFilesToBeRemoved: MarkFilesToBeRemoved,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    if (event.payload.regularSubscriptionUuid === undefined) {
      return
    }

    const result = await this.markFilesToBeRemoved.execute({
      ownerUuid: event.payload.userUuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not mark files for removal for user ${event.payload.userUuid}: ${result.getError()}`)

      return
    }

    const filesRemoved = result.getValue()

    this.logger.debug(`Marked ${filesRemoved.length} files for removal for user ${event.payload.userUuid}`)

    for (const fileRemoved of filesRemoved) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileRemovedEvent({
          regularSubscriptionUuid: event.payload.regularSubscriptionUuid,
          userUuid: fileRemoved.userOrSharedVaultUuid,
          filePath: fileRemoved.filePath,
          fileName: fileRemoved.fileName,
          fileByteSize: fileRemoved.fileByteSize,
        }),
      )
    }
  }
}
