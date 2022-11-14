import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { Stream } from 'stream'

const requestRecalculation = async (
  userRepository: UserRepositoryInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  logger: Logger,
): Promise<void> => {
  const stream = await userRepository.streamAll()

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        new Stream.Transform({
          objectMode: true,
          transform: async (rawUserData, _encoding, callback) => {
            try {
              await domainEventPublisher.publish(
                domainEventFactory.createUserContentSizeRecalculationRequestedEvent(rawUserData.user_uuid),
              )
            } catch (error) {
              logger.error(`Could not process user ${rawUserData.user_uuid}: ${(error as Error).message}`)
            }

            callback()
          },
        }),
      )
      .on('finish', resolve)
      .on('error', reject)
  })
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting content size recalculation requests ...')

  const userRepository: UserRepositoryInterface = container.get(TYPES.UserRepository)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise.resolve(requestRecalculation(userRepository, domainEventFactory, domainEventPublisher, logger))
    .then(() => {
      logger.info('content size recalculation requesting complete')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish content size recalculation requesting : ${error.message}`)

      process.exit(1)
    })
})
