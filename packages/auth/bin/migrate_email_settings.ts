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
import { SettingName } from '@standardnotes/settings'
import { EmailLevel } from '@standardnotes/domain-core'
import { UserSubscriptionServiceInterface } from '../src/Domain/Subscription/UserSubscriptionServiceInterface'
import { UserRepositoryInterface } from '../src/Domain/User/UserRepositoryInterface'
import { SubscriptionSettingServiceInterface } from '../src/Domain/Setting/SubscriptionSettingServiceInterface'
import { EncryptionVersion } from '../src/Domain/Encryption/EncryptionVersion'

const requestSettingMigration = async (
  settingRepository: SettingRepositoryInterface,
  subscriptionSettingService: SubscriptionSettingServiceInterface,
  userRepository: UserRepositoryInterface,
  userSubscriptionService: UserSubscriptionServiceInterface,
  domainEventFactory: DomainEventFactoryInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const stream = await settingRepository.streamAllByNameAndValue(
    SettingName.create(SettingName.NAMES.MuteSignInEmails).getValue(),
    'not_muted',
  )

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        new Stream.Transform({
          objectMode: true,
          transform: async (setting, _encoding, callback) => {
            const user = await userRepository.findOneByUuid(setting.setting_user_uuid)
            if (!user) {
              callback()

              return
            }

            const { regularSubscription, sharedSubscription } =
              await userSubscriptionService.findRegularSubscriptionForUserUuid(user.uuid)

            const subscription = sharedSubscription ?? regularSubscription
            if (!subscription) {
              await domainEventPublisher.publish(
                domainEventFactory.createMuteEmailsSettingChangedEvent({
                  username: user.email,
                  mute: true,
                  emailSubscriptionRejectionLevel: EmailLevel.LEVELS.SignIn,
                }),
              )

              await settingRepository.deleteByUserUuid({
                userUuid: user.uuid,
                settingName: SettingName.NAMES.MuteSignInEmails,
              })

              callback()

              return
            }

            await subscriptionSettingService.createOrReplace({
              userSubscription: subscription,
              props: {
                name: SettingName.NAMES.MuteSignInEmails,
                sensitive: false,
                serverEncryptionVersion: EncryptionVersion.Unencrypted,
                unencryptedValue: 'not_muted',
              },
            })

            await settingRepository.deleteByUserUuid({
              userUuid: user.uuid,
              settingName: SettingName.NAMES.MuteSignInEmails,
            })

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

  logger.info('Starting migration of mute sign in emails settings to subscription settings...')

  const settingRepository: SettingRepositoryInterface = container.get(TYPES.SettingRepository)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)
  const subscriptionSettingService: SubscriptionSettingServiceInterface = container.get(
    TYPES.SubscriptionSettingService,
  )
  const userRepository: UserRepositoryInterface = container.get(TYPES.UserRepository)
  const userSubscriptionService: UserSubscriptionServiceInterface = container.get(TYPES.UserSubscriptionService)

  Promise.resolve(
    requestSettingMigration(
      settingRepository,
      subscriptionSettingService,
      userRepository,
      userSubscriptionService,
      domainEventFactory,
      domainEventPublisher,
    ),
  )
    .then(() => {
      logger.info('Migration of mute sign in emails settings to subscription settings finished successfully.')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Migration of mute sign in emails settings to subscription settings failed: ${error.message}`)

      process.exit(1)
    })
})
