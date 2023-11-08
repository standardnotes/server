import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DeleteAccountsFromCSVFile } from '../src/Domain/UseCase/DeleteAccountsFromCSVFile/DeleteAccountsFromCSVFile'

const inputArgs = process.argv.slice(2)
const fileName = inputArgs[0]
const mode = inputArgs[1]

const deleteAccounts = async (deleteAccountsFromCSVFile: DeleteAccountsFromCSVFile): Promise<void> => {
  await deleteAccountsFromCSVFile.execute({
    fileName,
    dryRun: mode !== 'delete',
  })
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting mass accounts deletion from CSV file')

  const deleteAccountsFromCSVFile = container.get<DeleteAccountsFromCSVFile>(TYPES.Auth_DeleteAccountsFromCSVFile)

  Promise.resolve(deleteAccounts(deleteAccountsFromCSVFile))
    .then(() => {
      logger.info('Accounts deleted.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not delete accounts: ${error.message}`)

      process.exit(1)
    })
})
