import {
  DomainEventHandlerInterface,
  DomainEventPublisherInterface,
  SharedVaultRemovedEvent,
} from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

export class SharedVaultRemovedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private markFilesToBeRemoved: MarkFilesToBeRemoved,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async handle(event: SharedVaultRemovedEvent): Promise<void> {
    const result = await this.markFilesToBeRemoved.execute({
      ownerUuid: event.payload.sharedVaultUuid,
    })

    if (result.isFailed()) {
      this.logger.error(
        `Could not mark files to be removed for shared vault: ${event.payload.sharedVaultUuid}: ${result.getError()}`,
      )
    }

    const filesRemoved = result.getValue()

    this.logger.debug(
      `Marked ${filesRemoved.length} files for removal for shared vault ${event.payload.sharedVaultUuid}`,
    )

    for (const fileRemoved of filesRemoved) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createSharedVaultFileRemovedEvent({
          fileByteSize: fileRemoved.fileByteSize,
          fileName: fileRemoved.fileName,
          filePath: fileRemoved.filePath,
          sharedVaultUuid: event.payload.sharedVaultUuid,
          vaultOwnerUuid: event.payload.vaultOwnerUuid,
        }),
      )
    }
  }
}
