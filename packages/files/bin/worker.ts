import 'reflect-metadata'

import { OpenTelemetrySDK } from '@standardnotes/domain-events-infra'
import { ServiceIdentifier } from '@standardnotes/domain-core'

const sdk = new OpenTelemetrySDK({ serviceName: ServiceIdentifier.NAMES.FilesWorker })
sdk.start()

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Files_Logger)

  logger.info('Starting worker...')

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(
    TYPES.Files_DomainEventSubscriberFactory,
  )
  subscriberFactory.create().start()
})
