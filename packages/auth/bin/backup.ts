import 'reflect-metadata'

import 'newrelic'

import { Stream } from 'stream'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { SettingRepositoryInterface } from '../src/Domain/Setting/SettingRepositoryInterface'
import { MuteFailedBackupsEmailsOption, MuteFailedCloudBackupsEmailsOption, SettingName } from '@standardnotes/settings'
import { RoleServiceInterface } from '../src/Domain/Role/RoleServiceInterface'
import { PermissionName } from '@standardnotes/features'
import { SettingServiceInterface } from '../src/Domain/Setting/SettingServiceInterface'

const inputArgs = process.argv.slice(2)
const backupProvider = inputArgs[0]
const backupFrequency = inputArgs[1]

const requestBackups = async (
  settingRepository: SettingRepositoryInterface,
  roleService: RoleServiceInterface,
  settingService: SettingServiceInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  let settingName: SettingName,
    permissionName: PermissionName,
    muteEmailsSettingName: string,
    muteEmailsSettingValue: string,
    providerTokenSettingName: SettingName
  switch (backupProvider) {
    case 'email':
      settingName = SettingName.create(SettingName.NAMES.EmailBackupFrequency).getValue()
      permissionName = PermissionName.DailyEmailBackup
      muteEmailsSettingName = SettingName.NAMES.MuteFailedBackupsEmails
      muteEmailsSettingValue = MuteFailedBackupsEmailsOption.Muted
      break
    case 'dropbox':
      settingName = SettingName.create(SettingName.NAMES.DropboxBackupFrequency).getValue()
      permissionName = PermissionName.DailyDropboxBackup
      muteEmailsSettingName = SettingName.NAMES.MuteFailedCloudBackupsEmails
      muteEmailsSettingValue = MuteFailedCloudBackupsEmailsOption.Muted
      providerTokenSettingName = SettingName.create(SettingName.NAMES.DropboxBackupToken).getValue()
      break
    case 'one_drive':
      settingName = SettingName.create(SettingName.NAMES.OneDriveBackupFrequency).getValue()
      permissionName = PermissionName.DailyOneDriveBackup
      muteEmailsSettingName = SettingName.NAMES.MuteFailedCloudBackupsEmails
      muteEmailsSettingValue = MuteFailedCloudBackupsEmailsOption.Muted
      providerTokenSettingName = SettingName.create(SettingName.NAMES.OneDriveBackupToken).getValue()
      break
    case 'google_drive':
      settingName = SettingName.create(SettingName.NAMES.GoogleDriveBackupFrequency).getValue()
      permissionName = PermissionName.DailyGDriveBackup
      muteEmailsSettingName = SettingName.NAMES.MuteFailedCloudBackupsEmails
      muteEmailsSettingValue = MuteFailedCloudBackupsEmailsOption.Muted
      providerTokenSettingName = SettingName.create(SettingName.NAMES.GoogleDriveBackupToken).getValue()
      break
    default:
      throw new Error(`Not handled backup provider: ${backupProvider}`)
  }

  const stream = await settingRepository.streamAllByNameAndValue(settingName, backupFrequency)

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        new Stream.Transform({
          objectMode: true,
          transform: async (setting, _encoding, callback) => {
            const userIsPermittedForEmailBackups = await roleService.userHasPermission(
              setting.setting_user_uuid,
              permissionName,
            )
            if (!userIsPermittedForEmailBackups) {
              callback()

              return
            }

            let userHasEmailsMuted = false
            const emailsMutedSetting = await settingRepository.findOneByNameAndUserUuid(
              muteEmailsSettingName,
              setting.setting_user_uuid,
            )
            if (emailsMutedSetting !== null && emailsMutedSetting.value !== null) {
              userHasEmailsMuted = emailsMutedSetting.value === muteEmailsSettingValue
            }

            if (backupProvider === 'email') {
              await domainEventPublisher.publish(
                domainEventFactory.createEmailBackupRequestedEvent(
                  setting.setting_user_uuid,
                  emailsMutedSetting?.uuid as string,
                  userHasEmailsMuted,
                ),
              )

              callback()

              return
            }

            const cloudBackupProviderToken = await settingService.findSettingWithDecryptedValue({
              settingName: providerTokenSettingName,
              userUuid: setting.setting_user_uuid,
            })
            if (cloudBackupProviderToken === null || cloudBackupProviderToken.value === null) {
              callback()

              return
            }

            await domainEventPublisher.publish(
              domainEventFactory.createCloudBackupRequestedEvent(
                backupProvider.toUpperCase() as 'DROPBOX' | 'ONE_DRIVE' | 'GOOGLE_DRIVE',
                cloudBackupProviderToken.value,
                setting.setting_user_uuid,
                emailsMutedSetting?.uuid as string,
                userHasEmailsMuted,
              ),
            )
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

  logger.info(`Starting ${backupFrequency} ${backupProvider} backup requesting...`)

  const settingRepository: SettingRepositoryInterface = container.get(TYPES.SettingRepository)
  const roleService: RoleServiceInterface = container.get(TYPES.RoleService)
  const settingService: SettingServiceInterface = container.get(TYPES.SettingService)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise.resolve(
    requestBackups(settingRepository, roleService, settingService, domainEventFactory, domainEventPublisher),
  )
    .then(() => {
      logger.info(`${backupFrequency} ${backupProvider} backup requesting complete`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish ${backupFrequency} ${backupProvider} backup requesting: ${error.message}`)

      process.exit(1)
    })
})
