import { DomainEventHandlerInterface, ExtensionKeyGrantedEvent } from '@standardnotes/domain-events'
import { Username } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'
import { OfflineFeaturesTokenData } from '@standardnotes/security'
import { ContentDecoderInterface } from '@standardnotes/common'
import { Logger } from 'winston'

import { OfflineSettingServiceInterface } from '../Setting/OfflineSettingServiceInterface'
import { OfflineSettingName } from '../Setting/OfflineSettingName'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SetSettingValue } from '../UseCase/SetSettingValue/SetSettingValue'

export class ExtensionKeyGrantedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private setSettingValue: SetSettingValue,
    private offlineSettingService: OfflineSettingServiceInterface,
    private contentDecoder: ContentDecoderInterface,
    private logger: Logger,
  ) {}

  async handle(event: ExtensionKeyGrantedEvent): Promise<void> {
    const usernameOrError = Username.create(event.payload.userEmail)
    if (usernameOrError.isFailed()) {
      return
    }
    const username = usernameOrError.getValue()

    if (event.payload.offline) {
      const offlineFeaturesTokenDecoded = this.contentDecoder.decode(
        event.payload.offlineFeaturesToken as string,
        0,
      ) as OfflineFeaturesTokenData

      if (!offlineFeaturesTokenDecoded.extensionKey) {
        this.logger.warn('Could not decode offline features token')

        return
      }

      await this.offlineSettingService.createOrUpdate({
        email: username.value,
        name: OfflineSettingName.FeaturesToken,
        value: offlineFeaturesTokenDecoded.extensionKey,
      })

      return
    }

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (user === null) {
      this.logger.warn(`Could not find user with email: ${username.value}`)
      return
    }

    const result = await this.setSettingValue.execute({
      userUuid: user.uuid,
      settingName: SettingName.NAMES.ExtensionKey,
      value: event.payload.extensionKey,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not set extension key for user ${user.uuid}`)
    }
  }
}
