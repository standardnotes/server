import 'reflect-metadata'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { UserSubscriptionRepositoryInterface } from '../src/Domain/Subscription/UserSubscriptionRepositoryInterface'
import { SubscriptionPlanName } from '@standardnotes/domain-core'

const requestCleanup = async (
  userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const proSubscriptionPlan = SubscriptionPlanName.create(SubscriptionPlanName.NAMES.ProPlan).getValue()
  const plusSubscriptionPlan = SubscriptionPlanName.create(SubscriptionPlanName.NAMES.PlusPlan).getValue()

  const totalSubscriptions = await userSubscriptionRepository.countByPlanName([
    proSubscriptionPlan,
    plusSubscriptionPlan,
  ])

  const limitPerPage = 100
  const numberOfPages = Math.ceil(totalSubscriptions / limitPerPage)
  for (let i = 0; i < numberOfPages; i++) {
    const subscriptions = await userSubscriptionRepository.findByPlanName(
      [proSubscriptionPlan, plusSubscriptionPlan],
      i * limitPerPage,
      limitPerPage,
    )

    for (const subscription of subscriptions) {
      await domainEventPublisher.publish(
        domainEventFactory.createRevisionsCleanupRequestedEvent({
          userUuid: subscription.userUuid,
        }),
      )
    }
  }
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting revisions cleanup triggering...')

  const domainEventFactory = container.get<DomainEventFactoryInterface>(TYPES.Auth_DomainEventFactory)
  const domainEventPublisher = container.get<DomainEventPublisherInterface>(TYPES.Auth_DomainEventPublisher)
  const userSubscriptionRepository = container.get<UserSubscriptionRepositoryInterface>(
    TYPES.Auth_UserSubscriptionRepository,
  )

  Promise.resolve(requestCleanup(userSubscriptionRepository, domainEventFactory, domainEventPublisher))
    .then(() => {
      logger.info('Finished revisions cleanup triggering')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Failed to trigger revisions cleanup: ${(error as Error).message}`)

      process.exit(1)
    })
})
