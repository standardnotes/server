import 'reflect-metadata'

import { Logger } from 'winston'

import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import { OpenTelemetrySDKInterface } from '@standardnotes/domain-events-infra'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Sync_Logger)

  logger.info('Starting worker...')

  if (!container.get<boolean>(TYPES.Sync_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING)) {
    const openTelemetrySDK = container.get<OpenTelemetrySDKInterface>(TYPES.Sync_OpenTelemetrySDK)
    openTelemetrySDK.start()
  }

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(
    TYPES.Sync_DomainEventSubscriberFactory,
  )
  subscriberFactory.create().start()
})
