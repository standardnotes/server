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
import { MuteFailedBackupsEmailsOption, SettingName } from '@standardnotes/settings'
import { RoleServiceInterface } from '../src/Domain/Role/RoleServiceInterface'
import { PermissionName } from '@standardnotes/features'

const inputArgs = process.argv.slice(2)
const backupProvider = inputArgs[0]
const backupFrequency = inputArgs[1]

const requestBackups = async (
  settingRepository: SettingRepositoryInterface,
  roleService: RoleServiceInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const settingName = SettingName.create(SettingName.NAMES.EmailBackupFrequency).getValue()
  const permissionName = PermissionName.DailyEmailBackup
  const muteEmailsSettingName = SettingName.NAMES.MuteFailedBackupsEmails
  const muteEmailsSettingValue = MuteFailedBackupsEmailsOption.Muted

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

            await domainEventPublisher.publish(
              domainEventFactory.createEmailBackupRequestedEvent(
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

  const logger: Logger = container.get(TYPES.Auth_Logger)

  logger.info(`Starting ${backupFrequency} ${backupProvider} backup requesting...`)

  const settingRepository: SettingRepositoryInterface = container.get(TYPES.Auth_SettingRepository)
  const roleService: RoleServiceInterface = container.get(TYPES.Auth_RoleService)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.Auth_DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.Auth_DomainEventPublisher)

  Promise.resolve(requestBackups(settingRepository, roleService, domainEventFactory, domainEventPublisher))
    .then(() => {
      logger.info(`${backupFrequency} ${backupProvider} backup requesting complete`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish ${backupFrequency} ${backupProvider} backup requesting: ${error.message}`)

      process.exit(1)
    })
})
