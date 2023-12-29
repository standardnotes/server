import 'reflect-metadata'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { Uuid } from '@standardnotes/domain-core'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { UserSubscriptionRepositoryInterface } from '../src/Domain/Subscription/UserSubscriptionRepositoryInterface'
import { RoleServiceInterface } from '../src/Domain/Role/RoleServiceInterface'
import { UserSubscriptionType } from '../src/Domain/Subscription/UserSubscriptionType'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'

const fixRoles = async (
  userRepository: UserRepositoryInterface,
  userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  roleService: RoleServiceInterface,
): Promise<void> => {
  const subscriptions = await userSubscriptionRepository.findActiveByType(UserSubscriptionType.Shared)

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

    await roleService.addUserRoleBasedOnSubscription(user, subscription.planName)
  }
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info('Starting roles fix for shared subscriptions...')

  const userRepository = container.get<UserRepositoryInterface>(TYPES.Auth_UserRepository)
  const userSubscriptionRepository = container.get<UserSubscriptionRepositoryInterface>(
    TYPES.Auth_UserSubscriptionRepository,
  )
  const roleService = container.get<RoleServiceInterface>(TYPES.Auth_RoleService)

  Promise.resolve(fixRoles(userRepository, userSubscriptionRepository, roleService))
    .then(() => {
      logger.info('Finished fixing roles for shared subscriptions')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Error while fixing roles for shared subscriptions: ${(error as Error).message}`)

      process.exit(1)
    })
})
