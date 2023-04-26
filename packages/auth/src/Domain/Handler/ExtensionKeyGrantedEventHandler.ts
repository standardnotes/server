import { DomainEventHandlerInterface, ExtensionKeyGrantedEvent } from '@standardnotes/domain-events'
import { SettingName } from '@standardnotes/settings'
import { OfflineFeaturesTokenData } from '@standardnotes/security'
import { ContentDecoderInterface } from '@standardnotes/common'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { OfflineSettingServiceInterface } from '../Setting/OfflineSettingServiceInterface'
import { OfflineSettingName } from '../Setting/OfflineSettingName'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Username } from '@standardnotes/domain-core'

@injectable()
export class ExtensionKeyGrantedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.OfflineSettingService) private offlineSettingService: OfflineSettingServiceInterface,
    @inject(TYPES.ContenDecoder) private contentDecoder: ContentDecoderInterface,
    @inject(TYPES.Logger) private logger: Logger,
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

    await this.settingService.createOrReplace({
      user,
      props: {
        name: SettingName.NAMES.ExtensionKey,
        unencryptedValue: event.payload.extensionKey,
        serverEncryptionVersion: EncryptionVersion.Default,
        sensitive: true,
      },
    })
  }
}
