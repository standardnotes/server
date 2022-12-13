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
  year: number,
  month: number,
  itemRepository: ItemRepositoryInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  logger: Logger,
): Promise<void> => {
  const createdAfter = new Date(`${year}-${month}-1`)
  const createdBefore = new Date(`${month !== 12 ? year : year + 1}-${month !== 12 ? month + 1 : 1}-1`)

  logger.info(`Processing items between ${createdAfter.toISOString()} and ${createdBefore.toISOString()}`)

  const stream = await itemRepository.streamAll({
    createdBetween: [createdAfter, createdBefore],
    selectFields: ['user_uuid', 'uuid'],
    contentType: [ContentType.Note, ContentType.File],
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

            return callback()
          },
        }),
      )
      .on('finish', () => {
        logger.info(
          `Finished processing items between ${createdAfter.toISOString()} and ${createdBefore.toISOString()}`,
        )

        resolve()
      })
      .on('error', (error) => {
        logger.error(
          `Could not process items between ${createdAfter.toISOString()} and ${createdBefore.toISOString()}: ${JSON.stringify(
            error,
          )}`,
        )

        reject()
      })
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

  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022]

  const promises = []
  for (const year of years) {
    for (let i = 1; i <= 12; i++) {
      promises.push(fixRevisionsOwnership(year, i, itemRepository, domainEventFactory, domainEventPublisher, logger))
    }
  }

  Promise.all(promises)
    .then(() => {
      logger.info('revisions ownership fix complete.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish revisions ownership fix: ${error.message}`)

      process.exit(1)
    })
})
