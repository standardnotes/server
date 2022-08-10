import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { SettingRepositoryInterface } from '../src/Domain/Setting/SettingRepositoryInterface'
import { MuteFailedBackupsEmailsOption, SettingName } from '@standardnotes/settings'
import { RoleServiceInterface } from '../src/Domain/Role/RoleServiceInterface'
import { PermissionName } from '@standardnotes/features'
import { AnalyticsEntityRepositoryInterface } from '../src/Domain/Analytics/AnalyticsEntityRepositoryInterface'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'

const inputArgs = process.argv.slice(2)
const backupEmail = inputArgs[0]

const requestBackups = async (
  userRepository: UserRepositoryInterface,
  settingRepository: SettingRepositoryInterface,
  roleService: RoleServiceInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  analyticsEntityRepository: AnalyticsEntityRepositoryInterface,
  analyticsStore: AnalyticsStoreInterface,
): Promise<void> => {
  const permissionName = PermissionName.DailyEmailBackup
  const muteEmailsSettingName = SettingName.MuteFailedBackupsEmails
  const muteEmailsSettingValue = MuteFailedBackupsEmailsOption.Muted

  if (!backupEmail) {
    throw new Error('Could not trigger email backup for user - missing email parameter')
  }

  const user = await userRepository.findOneByEmail(backupEmail)
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

  const analyticsEntity = await analyticsEntityRepository.findOneByUserUuid(user.uuid)
  if (analyticsEntity === null) {
    return
  }

  await domainEventPublisher.publish(
    domainEventFactory.createEmailBackupRequestedEvent(
      user.uuid,
      emailsMutedSetting?.uuid as string,
      userHasEmailsMuted,
    ),
  )

  await analyticsStore.markActivity([AnalyticsActivity.EmailBackup], analyticsEntity.id, [
    Period.Today,
    Period.ThisWeek,
  ])
  await analyticsStore.unmarkActivity([AnalyticsActivity.EmailUnbackedUpData], analyticsEntity.id, [
    Period.Today,
    Period.ThisWeek,
  ])

  return
}

const container = new ContainerConfigLoader()
void container.load().then((container) => {
  dayjs.extend(utc)

  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info(`Starting email backup requesting for ${backupEmail} ...`)

  const settingRepository: SettingRepositoryInterface = container.get(TYPES.SettingRepository)
  const userRepository: UserRepositoryInterface = container.get(TYPES.UserRepository)
  const roleService: RoleServiceInterface = container.get(TYPES.RoleService)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)
  const analyticsEntityRepository: AnalyticsEntityRepositoryInterface = container.get(TYPES.AnalyticsEntityRepository)
  const analyticsStore: AnalyticsStoreInterface = container.get(TYPES.AnalyticsStore)

  Promise.resolve(
    requestBackups(
      userRepository,
      settingRepository,
      roleService,
      domainEventFactory,
      domainEventPublisher,
      analyticsEntityRepository,
      analyticsStore,
    ),
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
