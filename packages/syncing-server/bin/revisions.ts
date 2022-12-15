import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { ItemRepositoryInterface } from '../src/Domain/Item/ItemRepositoryInterface'
import { ContentType } from '@standardnotes/common'

const fixRevisionsOwnership = async (
  year: number,
  month: number,
  revisionsProcessingLimit: number,
  itemRepository: ItemRepositoryInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  logger: Logger,
): Promise<void> => {
  const createdAfter = new Date(`${year}-${month}-1`)
  const createdBefore = new Date(`${month !== 12 ? year : year + 1}-${month !== 12 ? month + 1 : 1}-1`)

  logger.info(`[${createdAfter.toISOString()} - ${createdBefore.toISOString()}] Processing items`)

  const itemsCount = await itemRepository.countAll({
    createdBetween: [createdAfter, createdBefore],
    selectString: 'item.uuid as uuid, item.user_uuid as userUuid',
    contentType: [ContentType.Note, ContentType.File],
    sortOrder: 'ASC',
    sortBy: 'uuid',
  })

  logger.info(
    `[${createdAfter.toISOString()} - ${createdBefore.toISOString()}] There are ${itemsCount} items to process.`,
  )

  const amountOfPages = Math.ceil(itemsCount / revisionsProcessingLimit)
  const tenPercentOfPages = Math.ceil(amountOfPages / 10)
  let itemsProcessedCounter = 0
  let itemsSkippedCounter = 0
  for (let page = 1; page <= amountOfPages; page++) {
    if (page % tenPercentOfPages === 0) {
      logger.info(
        `[${createdAfter.toISOString()} - ${createdBefore.toISOString()}] Processing page ${page}/${amountOfPages} of items.`,
      )
      logger.info(
        `[${createdAfter.toISOString()} - ${createdBefore.toISOString()}] Processed successfully/skipped items: ${itemsProcessedCounter}/${itemsSkippedCounter}.`,
      )
    }

    const items = await itemRepository.findAllRaw<{ uuid: string; userUuid: string }>({
      createdBetween: [createdAfter, createdBefore],
      selectString: 'item.uuid as uuid, item.user_uuid as userUuid',
      contentType: [ContentType.Note, ContentType.File],
      offset: (page - 1) * revisionsProcessingLimit,
      limit: revisionsProcessingLimit,
      sortOrder: 'ASC',
      sortBy: 'uuid',
    })

    if (items.length === 0) {
      logger.warn(
        `[${createdAfter.toISOString()} - ${createdBefore.toISOString()}] No items fetched for offset ${
          (page - 1) * revisionsProcessingLimit
        } and limit ${revisionsProcessingLimit}.`,
      )
    }

    for (const item of items) {
      if (!item.userUuid || !item.uuid) {
        itemsSkippedCounter++
        continue
      }

      await domainEventPublisher.publish(
        domainEventFactory.createRevisionsOwnershipUpdateRequestedEvent({
          userUuid: item.userUuid,
          itemUuid: item.uuid,
        }),
      )

      itemsProcessedCounter++
    }
  }
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

  const years = env.get('REVISION_YEARS').split(',')
  const months = env.get('REVISION_MONTHS').split(',')
  const revisionsProcessingLimit = env.get('REVISIONS_PROCESSING_LIMIT')

  const promises = []
  for (const year of years) {
    for (const month of months) {
      promises.push(
        fixRevisionsOwnership(
          +year,
          +month,
          +revisionsProcessingLimit,
          itemRepository,
          domainEventFactory,
          domainEventPublisher,
          logger,
        ),
      )
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
