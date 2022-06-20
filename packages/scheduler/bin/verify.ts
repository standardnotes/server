import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { TimerInterface } from '@standardnotes/time'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { VerifyPredicates } from '../src/Domain/UseCase/VerifyPredicates/VerifyPredicates'

const verifyJobs = async (timestamp: number, verifyPredicates: VerifyPredicates): Promise<void> => {
  await verifyPredicates.execute({ timestamp })
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)
  const timer: TimerInterface = container.get(TYPES.Timer)
  const now = timer.getTimestampInMicroseconds()

  logger.info(`Starting verification of overdue jobs. Current timestamp: ${now}`)

  const verifyPredicates: VerifyPredicates = container.get(TYPES.VerifyPredicates)

  Promise.resolve(verifyJobs(now, verifyPredicates))
    .then(() => {
      logger.info('Verification of overdue jobs complete.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish verification of overdue jobs: ${error.message}`)

      process.exit(1)
    })
})
