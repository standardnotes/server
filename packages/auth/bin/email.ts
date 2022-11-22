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
import { MuteMarketingEmailsOption, SettingName } from '@standardnotes/settings'
import { EmailMessageIdentifier } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'

const inputArgs = process.argv.slice(2)
const emailMessageIdentifier = inputArgs[0]

const sendEmailCampaign = async (
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
              if (!(rawUserData.user_email as string).includes('@standardnotes.com')) {
                callback()

                return
              }

              const emailsMutedSetting = await settingService.findSettingWithDecryptedValue({
                userUuid: rawUserData.user_uuid,
                settingName: SettingName.MuteMarketingEmails,
              })

              if (emailsMutedSetting === null || emailsMutedSetting.value === MuteMarketingEmailsOption.Muted) {
                callback()

                return
              }

              let activeSubscription = false
              let subscriptionPlanName = null

              const userSubscription = await userSubscriptionRepository.findOneByUserUuid(rawUserData.user_uuid)
              if (userSubscription !== null) {
                activeSubscription =
                  !userSubscription.cancelled && userSubscription.endsAt > timer.getTimestampInMicroseconds()
                subscriptionPlanName = userSubscription.planName
              }

              await domainEventPublisher.publish(
                domainEventFactory.createEmailMessageRequestedEvent({
                  userEmail: rawUserData.user_email,
                  messageIdentifier: emailMessageIdentifier as EmailMessageIdentifier,
                  context: {
                    activeSubscription,
                    subscriptionPlanName,
                    muteEmailsSettingUuid: emailsMutedSetting.uuid,
                  },
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

  logger.info(`Starting email campaign for email ${emailMessageIdentifier} ...`)

  if (!emailMessageIdentifier) {
    logger.error('No email message identifier passed as argument. Skipped sending.')

    process.exit(1)
  }

  const userRepository: UserRepositoryInterface = container.get(TYPES.UserRepository)
  const settingService: SettingServiceInterface = container.get(TYPES.SettingService)
  const userSubscriptionRepository: UserSubscriptionRepositoryInterface = container.get(
    TYPES.UserSubscriptionRepository,
  )
  const timer: TimerInterface = container.get(TYPES.Timer)
  const domainEventFactory: DomainEventFactoryInterface = container.get(TYPES.DomainEventFactory)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise.resolve(
    sendEmailCampaign(
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
      logger.info(`${emailMessageIdentifier} email campaign complete.`)

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish ${emailMessageIdentifier} email campaign: ${error.message}`)

      process.exit(1)
    })
})
