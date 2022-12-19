import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { CleanupSessionTraces } from '../src/Domain/UseCase/CleanupSessionTraces/CleanupSessionTraces'

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting session traces cleanup')

  const cleanupSessionTraces: CleanupSessionTraces = container.get(TYPES.CleanupSessionTraces)

  Promise.resolve(
    cleanupSessionTraces.execute({
      date: new Date(),
    }),
  )
    .then(() => {
      logger.info('Expired session traces cleaned.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not clean session traces: ${error.message}`)

      process.exit(1)
    })
})
