import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { FixContentSizes } from '../src/Domain/UseCase/Syncing/FixContentSizes/FixContentSizes'
import { Result } from '@standardnotes/domain-core'

const inputArgs = process.argv.slice(2)
const userUuid = inputArgs[0]

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Sync_Logger)

  logger.info('Starting fixing of content sizes', {
    userId: userUuid,
  })

  const fixContentSizes = container.get<FixContentSizes>(TYPES.Sync_FixContentSizes)

  Promise.resolve(fixContentSizes.execute({ userUuid }))
    .then((result: Result<void>) => {
      if (result.isFailed()) {
        logger.error(`Error while fixing content sizes: ${result.getError()}`, {
          userId: userUuid,
        })

        process.exit(1)
      }

      logger.info('Finished fixing of content sizes', {
        userId: userUuid,
      })

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Error while fixing content sizes: ${error.message}`, {
        userId: userUuid,
      })

      process.exit(1)
    })
})
