import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import { WorkerContainerConfigLoader } from '../src/Bootstrap/WorkerContainerConfigLoader'

const container = new WorkerContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting worker...')

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(TYPES.DomainEventSubscriberFactory)
  subscriberFactory.create().start()
})
