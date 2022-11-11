/* istanbul ignore file */

import { DomainEventHandlerInterface, UserContentSizeRecalculationRequestedEvent } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Stream } from 'stream'
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
  ) {}

  async handle(event: UserContentSizeRecalculationRequestedEvent): Promise<void> {
    const stream = await this.itemRepository.streamAll({
      deleted: false,
      userUuid: event.payload.userUuid,
      sortBy: 'updated_at_timestamp',
      sortOrder: 'ASC',
    })

    await new Promise((resolve, reject) => {
      stream
        .pipe(
          new Stream.Transform({
            objectMode: true,
            transform: async (item, _encoding, callback) => {
              const modelItem = await this.itemRepository.findByUuid(item.item_uuid)
              if (modelItem !== null) {
                modelItem.contentSize = Buffer.byteLength(JSON.stringify(this.itemProjector.projectFull(modelItem)))
                await this.itemRepository.save(modelItem)
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
