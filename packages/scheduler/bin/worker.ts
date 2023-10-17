import 'reflect-metadata'

import { OpenTelemetrySDK } from '@standardnotes/domain-events-infra'
import { ServiceIdentifier } from '@standardnotes/domain-core'

const sdk = new OpenTelemetrySDK({ serviceName: ServiceIdentifier.NAMES.SchedulerWorker })
sdk.start()

import { Logger } from 'winston'
import { DomainEventSubscriberInterface } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting worker...')

  const subscriber = container.get<DomainEventSubscriberInterface>(TYPES.DomainEventSubscriber)

  subscriber.start()
})
