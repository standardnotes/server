import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import { OpenTelemetrySDKInterface } from '@standardnotes/domain-events-infra'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting worker...')

  const openTelemetrySDK = container.get<OpenTelemetrySDKInterface>(TYPES.WebSockets_OpenTelemetrySDK)
  openTelemetrySDK.start()

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(TYPES.DomainEventSubscriberFactory)
  subscriberFactory.create().start()
})
