import 'reflect-metadata'

import 'newrelic'

import { Stream } from 'stream'

import { Logger } from 'winston'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'

import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { SettingServiceInterface } from '../src/Domain/Setting/SettingServiceInterface'
import { DomainEventFactoryInterface } from '../src/Domain/Event/DomainEventFactoryInterface'
import { UserSubscriptionRepositoryInterface } from '../src/Domain/Subscription/UserSubscriptionRepositoryInterface'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import {
  MuteFailedBackupsEmailsOption,
  MuteFailedCloudBackupsEmailsOption,
  MuteMarketingEmailsOption,
  MuteSignInEmailsOption,
  SettingName,
} from '@standardnotes/settings'
import { TimerInterface } from '@standardnotes/time'

const syncEmailSubscriptions = async (
  userRepository: UserRepositoryInterface,
  settingService: SettingServiceInterface,
  userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  timer: TimerInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
  logger: Logger,
): Promise<void> => {
  const stream = await userRepository.streamAll()

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        new Stream.Transform({
          objectMode: true,
          transform: async (rawUserData, _encoding, callback) => {
            try {
              const marketingEmailsMutedSetting = await settingService.findSettingWithDecryptedValue({
                userUuid: rawUserData.user_uuid,
                settingName: SettingName.MuteMarketingEmails,
              })

              const signInEmailsMutedSetting = await settingService.findSettingWithDecryptedValue({
                userUuid: rawUserData.user_uuid,
                settingName: SettingName.MuteSignInEmails,
              })

              const backupEmailsMutedSetting = await settingService.findSettingWithDecryptedValue({
                userUuid: rawUserData.user_uuid,
                settingName: SettingName.MuteFailedBackupsEmails,
              })

              const cloudBackupEmailsMutedSetting = await settingService.findSettingWithDecryptedValue({
                userUuid: rawUserData.user_uuid,
                settingName: SettingName.MuteFailedCloudBackupsEmails,
              })

              let activeSubscription = false
              let subscriptionPlanName = null

              const userSubscription = await userSubscriptionRepository.findOneByUserUuid(rawUserData.user_uuid)
              if (userSubscription !== null) {
                activeSubscription = userSubscription.endsAt > timer.getTimestampInMicroseconds()
                if (activeSubscription) {
                  subscriptionPlanName = userSubscription.planName
                }
              }

              await domainEventPublisher.publish(
                domainEventFactory.createEmailSubscriptionSyncRequestedEvent({
                  muteFailedBackupsEmails:
                    backupEmailsMutedSetting !== null &&
                    backupEmailsMutedSetting.value === MuteFailedBackupsEmailsOption.Muted,
                  muteFailedCloudBackupsEmails:
                    cloudBackupEmailsMutedSetting !== null &&
                    cloudBackupEmailsMutedSetting.value === MuteFailedCloudBackupsEmailsOption.Muted,
                  muteMarketingEmails:
                    marketingEmailsMutedSetting !== null &&
                    marketingEmailsMutedSetting.value === MuteMarketingEmailsOption.Muted,
                  muteSignInEmails:
                    signInEmailsMutedSetting !== null &&
                    signInEmailsMutedSetting.value === MuteSignInEmailsOption.Muted,
                  subscriptionPlanName,
                  userUuid: rawUserData.user_uuid,
                  username: rawUserData.user_email,
                }),
              )
            } catch (error) {
              logger.error(`Could not process user ${rawUserData.user_uuid}: ${(error as Error).message}`)
            }

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

  logger.info('Starting email subscriptions sync')

  const userRepository: UserRepositoryInterface = container.get(TYPES.UserRepository)
  const settingService: SettingServiceInterface = container.get(TYPES.SettingService)
  const userSubscriptionRepository: UserSubscriptionRepositoryInterface = container.get(
    TYPES.UserSubscriptionRepository,
  )
  const timer: TimerInterface = container.get(TYPES.Timer)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise.resolve(
    syncEmailSubscriptions(
      userRepository,
      settingService,
      userSubscriptionRepository,
      timer,
      domainEventFactory,
      domainEventPublisher,
      logger,
    ),
  )
    .then(() => {
      logger.info('Email subscriptions sync complete.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish email subscriptions sync: ${error.message}`)

      process.exit(1)
    })
})
