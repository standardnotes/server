import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberInterface } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting worker...')

  const subscriber = container.get<DomainEventSubscriberInterface>(TYPES.Auth_DomainEventSubscriber)

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Stopping worker...')
    subscriber.stop()
    logger.info('Worker stopped.')
  })

  subscriber.start()
})
