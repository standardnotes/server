import 'reflect-metadata'

import { Logger } from 'winston'
import * as AWSXRay from 'aws-xray-sdk'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { CleanupSessionTraces } from '../src/Domain/UseCase/CleanupSessionTraces/CleanupSessionTraces'
import { CleanupExpiredSessions } from '../src/Domain/UseCase/CleanupExpiredSessions/CleanupExpiredSessions'

const cleanup = async (
  cleanupSessionTraces: CleanupSessionTraces,
  cleanupExpiredSessions: CleanupExpiredSessions,
): Promise<void> => {
  const date = new Date()

  await cleanupSessionTraces.execute({ date })
  await cleanupExpiredSessions.execute({ date })
}

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

  logger.info('Starting sessions and session traces cleanup')

  const cleanupSessionTraces: CleanupSessionTraces = container.get(TYPES.Auth_CleanupSessionTraces)
  const cleanupExpiredSessions: CleanupExpiredSessions = container.get(TYPES.Auth_CleanupExpiredSessions)

  Promise.resolve(cleanup(cleanupSessionTraces, cleanupExpiredSessions))
    .then(() => {
      logger.info('Expired sessions and session traces cleaned.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not clean sessions and session traces: ${error.message}`)

      process.exit(1)
    })
})
