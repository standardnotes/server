import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { FixStorageQuotaForUser } from '../src/Domain/UseCase/FixStorageQuotaForUser/FixStorageQuotaForUser'

const inputArgs = process.argv.slice(2)
const userEmail = inputArgs[0]

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting storage quota fix...', {
    userId: userEmail,
  })

  const fixStorageQuota = container.get<FixStorageQuotaForUser>(TYPES.Auth_FixStorageQuotaForUser)

  Promise.resolve(
    fixStorageQuota.execute({
      userEmail,
    }),
  )
    .then(() => {
      logger.info('Storage quota fixed', {
        userId: userEmail,
      })

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not fix storage quota: ${error.message}`, {
        userId: userEmail,
      })

      process.exit(1)
    })
})
