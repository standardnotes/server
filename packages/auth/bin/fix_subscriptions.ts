import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { UserSubscriptionRepositoryInterface } from '../src/Domain/Subscription/UserSubscriptionRepositoryInterface'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { Uuid } from '@standardnotes/domain-core'

const fixSubscriptions = async (
  userRepository: UserRepositoryInterface,
  userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const subscriptions = await userSubscriptionRepository.findBySubscriptionId(0)

  for (const subscription of subscriptions) {
    const userUuidOrError = Uuid.create(subscription.userUuid)
    if (userUuidOrError.isFailed()) {
      continue
    }
    const userUuid = userUuidOrError.getValue()

    const user = await userRepository.findOneByUuid(userUuid)
    if (!user) {
      continue
    }

    await domainEventPublisher.publish(
      domainEventFactory.createSubscriptionStateRequestedEvent({
        userEmail: user.email,
      }),
    )
  }
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting to fix subscriptions with missing subscriptionId ...')

  const userRepository = container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository)
  const userSubscriptionRepository = container.get<UserSubscriptionRepositoryInterface>(
    TYPES.Auth_UserSubscriptionRepository,
  )
  const domainEventFactory = container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory)
  const domainEventPublisher = container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher)

  Promise.resolve(
    fixSubscriptions(userRepository, userSubscriptionRepository, domainEventFactory, domainEventPublisher),
  )
    .then(() => {
      logger.info('Finished fixing subscriptions with missing subscriptionId.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error('Failed to fix subscriptions with missing subscriptionId.', {
        error: error.message,
        stack: error.stack,
      })

      process.exit(1)
    })
})
