import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { OpenTelemetrySDKInterface } from '@standardnotes/domain-events-infra'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Files_Logger)

  logger.info('Starting worker...')

  if (!container.get<boolean>(TYPES.Files_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING)) {
    const openTelemetrySDK = container.get<OpenTelemetrySDKInterface>(TYPES.Files_OpenTelemetrySDK)
    openTelemetrySDK.start()
  }

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(
    TYPES.Files_DomainEventSubscriberFactory,
  )
  subscriberFactory.create().start()
})
