import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as AWSXRay from 'aws-xray-sdk'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const isConfiguredForAWSProduction =
    env.get('MODE', true) !== 'home-server' && env.get('MODE', true) !== 'self-hosted'

  if (isConfiguredForAWSProduction) {
    AWSXRay.enableManualMode()
    AWSXRay.config([AWSXRay.plugins.ECSPlugin])
  }

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting worker...')

  const subscriberFactory: DomainEventSubscriberFactoryInterface = container.get(
    TYPES.Auth_DomainEventSubscriberFactory,
  )
  subscriberFactory.create().start()
})
