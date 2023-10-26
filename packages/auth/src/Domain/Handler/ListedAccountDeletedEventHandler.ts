import { Username } from '@standardnotes/domain-core'
import { DomainEventHandlerInterface, ListedAccountDeletedEvent } from '@standardnotes/domain-events'
import { ListedAuthorSecretsData, SettingName } from '@standardnotes/settings'
import { Logger } from 'winston'

import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { GetSetting } from '../UseCase/GetSetting/GetSetting'
import { SetSettingValue } from '../UseCase/SetSettingValue/SetSettingValue'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'

export class ListedAccountDeletedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getSetting: GetSetting,
    private setSettingValue: SetSettingValue,
    private logger: Logger,
  ) {}

  async handle(event: ListedAccountDeletedEvent): Promise<void> {
    const usernameOrError = Username.create(event.payload.userEmail)
    if (usernameOrError.isFailed()) {
      return
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (user === null) {
      this.logger.warn(`Could not find user with email ${username.value}`)

      return
    }

    const listedAuthorSecretsSettingOrError = await this.getSetting.execute({
      settingName: SettingName.NAMES.ListedAuthorSecrets,
      decrypted: true,
      userUuid: user.uuid,
      allowSensitiveRetrieval: false,
    })
    if (listedAuthorSecretsSettingOrError.isFailed()) {
      this.logger.error(`Could not find listed secrets setting for user ${user.uuid}`)

      return
    }

    const listedAuthorSecretsSetting = listedAuthorSecretsSettingOrError.getValue()

    const existingSecrets: ListedAuthorSecretsData = JSON.parse(listedAuthorSecretsSetting.decryptedValue as string)
    const filteredSecrets = existingSecrets.filter(
      (secret) =>
        secret.authorId !== event.payload.userId ||
        (secret.authorId === event.payload.userId && secret.hostUrl !== event.payload.hostUrl),
    )

    const result = await this.setSettingValue.execute({
      settingName: SettingName.NAMES.ListedAuthorSecrets,
      value: JSON.stringify(filteredSecrets),
      serverEncryptionVersion: EncryptionVersion.Default,
      userUuid: user.uuid,
    })

    if (result.isFailed()) {
      this.logger.error(`Could not update listed author secrets for user with uuid ${user.uuid}`)
    }
  }
}
