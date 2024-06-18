import 'reflect-metadata'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { RoleServiceInterface } from '../src/Domain/Role/RoleServiceInterface'
import { PermissionName } from '@standardnotes/features'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { GetUserKeyParams } from '../src/Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { Email } from '@standardnotes/domain-core'

const inputArgs = process.argv.slice(2)
const backupEmail = inputArgs[0]

const requestBackups = async (
  userRepository: UserRepositoryInterface,
  roleService: RoleServiceInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  getUserKeyParamsUseCase: GetUserKeyParams,
): Promise<void> => {
  const permissionName = PermissionName.DailyEmailBackup

  const emailOrError = Email.create(backupEmail)
  if (emailOrError.isFailed()) {
    throw new Error('Could not trigger email backup for user - missing email parameter')
  }
  const email = emailOrError.getValue()

  const user = await userRepository.findOneByUsernameOrEmail(email)
  if (user === null) {
    throw new Error(`Could not find user with email: ${backupEmail}`)
  }

  const userIsPermittedForEmailBackups = await roleService.userHasPermission(user.uuid, permissionName)
  if (!userIsPermittedForEmailBackups) {
    throw new Error(`User ${backupEmail} is not permitted for email backups`)
  }

  const keyParamsResponse = await getUserKeyParamsUseCase.execute({
    userUuid: user.uuid,
    authenticated: false,
  })

  await domainEventPublisher.publish(
    domainEventFactory.createEmailBackupRequestedEvent(user.uuid, keyParamsResponse.keyParams),
  )

  return
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info(`Starting email backup requesting for ${backupEmail} ...`)

  const userRepository: UserRepositoryInterface = container.get(TYPES.Auth_UserRepository)
  const roleService: RoleServiceInterface = container.get(TYPES.Auth_RoleService)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.Auth_DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.Auth_DomainEventPublisher)
  const getUserKeyParamsUseCase: GetUserKeyParams = container.get(TYPES.Auth_GetUserKeyParams)

  Promise.resolve(
    requestBackups(userRepository, roleService, domainEventFactory, domainEventPublisher, getUserKeyParamsUseCase),
  )
    .then(() => {
      logger.info(`Email backup requesting complete for ${backupEmail}`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish email backup requesting for ${backupEmail}: ${error.message}`)

      process.exit(1)
    })
})
