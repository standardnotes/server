import 'reflect-metadata'

import { Logger } from 'winston'

import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Sync_Logger)

  logger.info('Starting worker...')

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(
    TYPES.Sync_DomainEventSubscriberFactory,
  )
  subscriberFactory.create().start()
})
