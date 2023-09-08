import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { TriggerTransitionFromPrimaryToSecondaryDatabaseForUser } from '../src/Domain/UseCase/Transition/TriggerTransitionFromPrimaryToSecondaryDatabaseForUser/TriggerTransitionFromPrimaryToSecondaryDatabaseForUser'

const inputArgs = process.argv.slice(2)
const userUuid = inputArgs[0]

const requestTransition = async (
  triggerTransitionFromPrimaryToSecondaryDatabaseForUser: TriggerTransitionFromPrimaryToSecondaryDatabaseForUser,
  logger: Logger,
): Promise<void> => {
  const result = await triggerTransitionFromPrimaryToSecondaryDatabaseForUser.execute({
    userUuid,
  })
  if (result.isFailed()) {
    logger.error(`Could not trigger transition for user ${userUuid}: ${result.getError()}`)
  }

  return
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Sync_Logger)

  logger.info(`Starting transitiong for user ${userUuid} ...`)

  const triggerTransitionFromPrimaryToSecondaryDatabaseForUser: TriggerTransitionFromPrimaryToSecondaryDatabaseForUser =
    container.get(TYPES.Sync_TriggerTransitionFromPrimaryToSecondaryDatabaseForUser)

  Promise.resolve(requestTransition(triggerTransitionFromPrimaryToSecondaryDatabaseForUser, logger))
    .then(() => {
      logger.info(`Transition triggered for user ${userUuid}`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not trigger transition for user ${userUuid}: ${error.message}`)

      process.exit(1)
    })
})
