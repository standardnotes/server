/* istanbul ignore file */

import { DomainEventHandlerInterface, UserContentSizeRecalculationRequestedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Stream } from 'stream'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ItemProjection } from '../../Projection/ItemProjection'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { Item } from '../Item/Item'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'

@injectable()
export class UserContentSizeRecalculationRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: UserContentSizeRecalculationRequestedEvent): Promise<void> {
    this.logger.debug(`Starting content size recalculation for user: ${event.payload.userUuid}`)

    const stream = await this.itemRepository.streamAll({
      deleted: false,
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    const loggerHandle = this.logger

    await new Promise((resolve, reject) => {
      stream
        .pipe(
          new Stream.Transform({
            objectMode: true,
            transform: async (item, _encoding, callback) => {
              if (!item.item_uuid) {
                callback()

                return
              }
              loggerHandle.debug(`Fixing content size for item ${item.item_uuid}`)

              const modelItem = await this.itemRepository.findByUuid(item.item_uuid)
              if (modelItem !== null) {
                const fixedContentSize = Buffer.byteLength(
                  JSON.stringify(await this.itemProjector.projectFull(modelItem)),
                )
                if (modelItem.contentSize !== fixedContentSize) {
                  loggerHandle.debug(`Fixing content size from ${modelItem.contentSize} to ${fixedContentSize}`)

                  modelItem.contentSize = fixedContentSize

                  await this.itemRepository.save(modelItem)
                }
                callback()

                return
              }

              callback()

              return
            },
          }),
        )
        .on('finish', resolve)
        .on('error', reject)
    })
  }
}
