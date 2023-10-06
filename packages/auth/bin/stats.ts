import 'reflect-metadata'

import { Logger } from 'winston'
import { TimerInterface } from '@standardnotes/time'
import * as AWSXRay from 'aws-xray-sdk'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { PersistStatistics } from '../src/Domain/UseCase/PersistStatistics/PersistStatistics'

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const isConfiguredForAWSProduction =
    env.get('MODE', true) !== 'home-server' && env.get('MODE', true) !== 'self-hosted'

  if (isConfiguredForAWSProduction) {
    AWSXRay.enableManualMode()
    AWSXRay.config([AWSXRay.plugins.ECSPlugin])
  }

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting session traces cleanup')

  const persistStats: PersistStatistics = container.get(TYPES.Auth_PersistStatistics)
  const timer: TimerInterface = container.get(TYPES.Auth_Timer)

  Promise.resolve(
    persistStats.execute({
      sessionsInADay: timer.getUTCDateNDaysAgo(1),
    }),
  )
    .then(() => {
      logger.info('Stats persisted.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not persist stats: ${error.message}`)

      process.exit(1)
    })
})
