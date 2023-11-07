import 'reflect-metadata'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { TriggerEmailBackupForAllUsers } from '../src/Domain/UseCase/TriggerEmailBackupForAllUsers/TriggerEmailBackupForAllUsers'

const inputArgs = process.argv.slice(2)
const backupFrequency = inputArgs[0]

const requestBackups = async (triggerEmailBackupForAllUsers: TriggerEmailBackupForAllUsers): Promise<void> => {
  await triggerEmailBackupForAllUsers.execute({ backupFrequency })
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info(`Starting ${backupFrequency} email backup requesting...`)

  const triggerEmailBackupForAllUsers: TriggerEmailBackupForAllUsers = container.get(
    TYPES.Auth_TriggerEmailBackupForAllUsers,
  )

  Promise.resolve(requestBackups(triggerEmailBackupForAllUsers))
    .then(() => {
      logger.info(`${backupFrequency} email backup requesting complete`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish ${backupFrequency} email backup requesting: ${error.message}`)

      process.exit(1)
    })
})
