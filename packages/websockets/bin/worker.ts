import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberInterface } from '@standardnotes/domain-events'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting worker...')

  const subscriber = container.get<DomainEventSubscriberInterface>(TYPES.DomainEventSubscriber)

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Stopping worker...')
    subscriber.stop()
    logger.info('Worker stopped.')
  })

  subscriber.start()
})
