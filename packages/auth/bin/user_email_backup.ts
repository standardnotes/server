import 'reflect-metadata'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as AWSXRay from 'aws-xray-sdk'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { SettingRepositoryInterface } from '../src/Domain/Setting/SettingRepositoryInterface'
import { MuteFailedBackupsEmailsOption, SettingName } from '@standardnotes/settings'
import { RoleServiceInterface } from '../src/Domain/Role/RoleServiceInterface'
import { PermissionName } from '@standardnotes/features'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { Email } from '@standardnotes/domain-core'

const inputArgs = process.argv.slice(2)
const backupEmail = inputArgs[0]

const requestBackups = async (
  userRepository: UserRepositoryInterface,
  settingRepository: SettingRepositoryInterface,
  roleService: RoleServiceInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const permissionName = PermissionName.DailyEmailBackup
  const muteEmailsSettingName = SettingName.NAMES.MuteFailedBackupsEmails
  const muteEmailsSettingValue = MuteFailedBackupsEmailsOption.Muted

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

  let userHasEmailsMuted = false
  const emailsMutedSetting = await settingRepository.findOneByNameAndUserUuid(muteEmailsSettingName, user.uuid)
  if (emailsMutedSetting !== null && emailsMutedSetting.value !== null) {
    userHasEmailsMuted = emailsMutedSetting.value === muteEmailsSettingValue
  }

  await domainEventPublisher.publish(
    domainEventFactory.createEmailBackupRequestedEvent(
      user.uuid,
      emailsMutedSetting?.uuid as string,
      userHasEmailsMuted,
    ),
  )

  return
}

const container = new ContainerConfigLoader('worker')
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const isConfiguredForAWSProduction =
    env.get('MODE', true) !== 'home-server' && env.get('MODE', true) !== 'self-hosted'

  if (isConfiguredForAWSProduction) {
    AWSXRay.enableManualMode()
    AWSXRay.config([AWSXRay.plugins.ECSPlugin])
  }

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info(`Starting email backup requesting for ${backupEmail} ...`)

  const settingRepository: SettingRepositoryInterface = container.get(TYPES.Auth_SettingRepository)
  const userRepository: UserRepositoryInterface = container.get(TYPES.Auth_UserRepository)
  const roleService: RoleServiceInterface = container.get(TYPES.Auth_RoleService)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.Auth_DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.Auth_DomainEventPublisher)

  Promise.resolve(
    requestBackups(userRepository, settingRepository, roleService, domainEventFactory, domainEventPublisher),
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
