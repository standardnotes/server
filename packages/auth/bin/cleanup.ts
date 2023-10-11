import 'reflect-metadata'

import { OpenTelemetrySDK, OpenTelemetryTracer } from '@standardnotes/domain-events-infra'
import { ServiceIdentifier } from '@standardnotes/domain-core'

const sdk = new OpenTelemetrySDK(ServiceIdentifier.NAMES.AuthScheduledTask)
sdk.start()

import { Logger } from 'winston'

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

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting sessions and session traces cleanup')

  const cleanupSessionTraces: CleanupSessionTraces = container.get(TYPES.Auth_CleanupSessionTraces)
  const cleanupExpiredSessions: CleanupExpiredSessions = container.get(TYPES.Auth_CleanupExpiredSessions)

  const tracer = new OpenTelemetryTracer()
  tracer.startSpan(ServiceIdentifier.NAMES.AuthScheduledTask, 'cleanup')

  Promise.resolve(cleanup(cleanupSessionTraces, cleanupExpiredSessions))
    .then(() => {
      logger.info('Expired sessions and session traces cleaned.')

      tracer.stopSpan()

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not clean sessions and session traces: ${error.message}`)

      tracer.stopSpanWithError(error)

      process.exit(1)
    })
})
