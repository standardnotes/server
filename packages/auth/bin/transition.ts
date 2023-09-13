import 'reflect-metadata'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { TransitionStatusRepositoryInterface } from '../src/Domain/Transition/TransitionStatusRepositoryInterface'
import { TimerInterface } from '@standardnotes/time'

const inputArgs = process.argv.slice(2)
const startDateString = inputArgs[0]
const endDateString = inputArgs[1]

const requestTransition = async (
  userRepository: UserRepositoryInterface,
  transitionStatusRepository: TransitionStatusRepositoryInterface,
  logger: Logger,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  timer: TimerInterface,
): Promise<void> => {
  const startDate = new Date(startDateString)
  const endDate = new Date(endDateString)

  const users = await userRepository.findAllCreatedBetween(startDate, endDate)

  const timestamp = timer.getTimestampInMicroseconds()

  logger.info(
    `[TRANSITION ${timestamp}] Found ${users.length} users created between ${startDateString} and ${endDateString}`,
  )

  let usersTriggered = 0
  for (const user of users) {
    const transitionRequestedEvent = domainEventFactory.createTransitionRequestedEvent({
      userUuid: user.uuid,
      type: 'items',
      timestamp,
    })

    usersTriggered += 1

    await domainEventPublisher.publish(transitionRequestedEvent)
  }

  logger.info(
    `[TRANSITION ${timestamp}] Triggered transition for ${usersTriggered} users created between ${startDateString} and ${endDateString}`,
  )

  const revisionStatuses = await transitionStatusRepository.getStatuses('revisions')
  const failedStatuses = revisionStatuses.filter((status) => status.status === 'FAILED')

  logger.info(`[TRANSITION ${timestamp}] Found ${failedStatuses.length} failed revision transitions`)

  for (const status of failedStatuses) {
    const transitionRequestedEvent = domainEventFactory.createTransitionRequestedEvent({
      userUuid: status.userUuid,
      type: 'revisions',
      timestamp,
    })

    await domainEventPublisher.publish(transitionRequestedEvent)
  }
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info(`Starting transition request for users created between ${startDateString} and ${endDateString}`)

  const userRepository: UserRepositoryInterface = container.get(TYPES.Auth_UserRepository)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.Auth_DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.Auth_DomainEventPublisher)
  const transitionStatusRepository: TransitionStatusRepositoryInterface = container.get(
    TYPES.Auth_TransitionStatusRepository,
  )
  const timer = container.get<TimerInterface>(TYPES.Auth_Timer)

  Promise.resolve(
    requestTransition(
      userRepository,
      transitionStatusRepository,
      logger,
      domainEventFactory,
      domainEventPublisher,
      timer,
    ),
  )
    .then(() => {
      logger.info(`Finished transition request for users created between ${startDateString} and ${endDateString}`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(
        `Error while requesting transition for users created between ${startDateString} and ${endDateString}: ${error}`,
      )

      process.exit(1)
    })
})
