import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { ItemRepositoryInterface } from '../src/Domain/Item/ItemRepositoryInterface'
import { Stream } from 'stream'
import { ContentType } from '@standardnotes/common'

const fixRevisionsOwnership = async (
  itemRepository: ItemRepositoryInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  logger: Logger,
): Promise<void> => {
  const stream = await itemRepository.streamAll({
    createdBefore: new Date('2022-11-23'),
    selectFields: ['user_uuid', 'uuid'],
    contentType: ContentType.File,
  })

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        new Stream.Transform({
          objectMode: true,
          transform: async (rawItemData, _encoding, callback) => {
            try {
              if (!rawItemData.user_uuid || !rawItemData.item_uuid) {
                logger.error('Could not process item %O', rawItemData)

                return callback()
              }

              await domainEventPublisher.publish(
                domainEventFactory.createRevisionsOwnershipUpdateRequestedEvent({
                  userUuid: rawItemData.user_uuid,
                  itemUuid: rawItemData.item_uuid,
                }),
              )
            } catch (error) {
              logger.error(`Could not process item ${rawItemData.item_uuid}: ${(error as Error).message}`)
            }

            callback()
          },
        }),
      )
      .on('finish', resolve)
      .on('error', reject)
  })
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting revisions ownership fixing')

  const itemRepository: ItemRepositoryInterface = container.get(TYPES.ItemRepository)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise.resolve(fixRevisionsOwnership(itemRepository, domainEventFactory, domainEventPublisher, logger))
    .then(() => {
      logger.info('revisions ownership fix complete.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish revisions ownership fix: ${error.message}`)

      process.exit(1)
    })
})
