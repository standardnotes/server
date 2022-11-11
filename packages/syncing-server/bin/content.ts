import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

const inputArgs = process.argv.slice(2)
const userUuid = inputArgs[0]

const fixContentSize = async (
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  await domainEventPublisher.publish(domainEventFactory.createUserContentSizeRecalculationRequestedEvent(userUuid))
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info(`Starting content size fixing for user ${userUuid} ...`)

  if (!userUuid) {
    logger.error('No user uuid passed as argument. Skipped.')

    process.exit(1)
  }

  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise.resolve(fixContentSize(domainEventFactory, domainEventPublisher))
    .then(() => {
      logger.info('Content size fix complete.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish content size fix: ${error.message}`)

      process.exit(1)
    })
})
