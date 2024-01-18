import { ContentSizesFixRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { FixContentSizes } from '../UseCase/Syncing/FixContentSizes/FixContentSizes'

export class ContentSizesFixRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private fixContentSizes: FixContentSizes,
    private logger: Logger,
  ) {}

  async handle(event: ContentSizesFixRequestedEvent): Promise<void> {
    const result = await this.fixContentSizes.execute({ userUuid: event.payload.userUuid })

    if (result.isFailed()) {
      this.logger.error(`Failed to fix content sizes: ${result.getError()}`, {
        userId: event.payload.userUuid,
      })

      return
    }

    this.logger.info('Finished fixing content sizes', {
      userId: event.payload.userUuid,
    })
  }
}
