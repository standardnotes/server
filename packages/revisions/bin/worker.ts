import 'reflect-metadata'

import { OpenTelemetrySDK } from '@standardnotes/domain-events-infra'
import { ServiceIdentifier } from '@standardnotes/domain-core'

const sdk = new OpenTelemetrySDK(ServiceIdentifier.NAMES.RevisionsWorker)
sdk.start()

import { Logger } from 'winston'

import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Revisions_Logger)

  logger.info('Starting worker...')

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(
    TYPES.Revisions_DomainEventSubscriberFactory,
  )
  subscriberFactory.create().start()
})
