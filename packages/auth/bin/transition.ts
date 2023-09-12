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
import { RoleName } from '@standardnotes/domain-core'

const inputArgs = process.argv.slice(2)
const startDateString = inputArgs[0]
const endDateString = inputArgs[1]

const requestTransition = async (
  userRepository: UserRepositoryInterface,
  logger: Logger,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const startDate = new Date(startDateString)
  const endDate = new Date(endDateString)

  const users = await userRepository.findAllCreatedBetween(startDate, endDate)

  logger.info(`Found ${users.length} users created between ${startDateString} and ${endDateString}`)

  let usersTriggered = 0
  for (const user of users) {
    const roles = await user.roles
    const userHasTransitionUserRole = roles.some((role) => role.name === RoleName.NAMES.TransitionUser) === true
    if (userHasTransitionUserRole === true) {
      continue
    }

    const transitionRequestedEvent = domainEventFactory.createTransitionRequestedEvent({ userUuid: user.uuid })

    usersTriggered += 1

    await domainEventPublisher.publish(transitionRequestedEvent)
  }

  logger.info(
    `Triggered transition for ${usersTriggered} users created between ${startDateString} and ${endDateString}`,
  )
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

  Promise.resolve(requestTransition(userRepository, logger, domainEventFactory, domainEventPublisher))
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
