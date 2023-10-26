import { SettingName, Username } from '@standardnotes/domain-core'
import { DomainEventHandlerInterface, ListedAccountCreatedEvent } from '@standardnotes/domain-events'
import { ListedAuthorSecretsData } from '@standardnotes/settings'
import { Logger } from 'winston'

import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { GetSetting } from '../UseCase/GetSetting/GetSetting'
import { SetSettingValue } from '../UseCase/SetSettingValue/SetSettingValue'

export class ListedAccountCreatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private getSetting: GetSetting,
    private setSettingValue: SetSettingValue,
    private logger: Logger,
  ) {}

  async handle(event: ListedAccountCreatedEvent): Promise<void> {
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

    const newSecret = { authorId: event.payload.userId, secret: event.payload.secret, hostUrl: event.payload.hostUrl }

    let authSecrets: ListedAuthorSecretsData = [newSecret]

    const listedAuthorSecretsSettingOrError = await this.getSetting.execute({
      settingName: SettingName.NAMES.ListedAuthorSecrets,
      userUuid: user.uuid,
      decrypted: true,
      allowSensitiveRetrieval: false,
    })
    if (!listedAuthorSecretsSettingOrError.isFailed()) {
      const listedAuthorSecretsSetting = listedAuthorSecretsSettingOrError.getValue()
      const existingSecrets: ListedAuthorSecretsData = JSON.parse(listedAuthorSecretsSetting.decryptedValue as string)
      existingSecrets.push(newSecret)
      authSecrets = existingSecrets
    }

    const result = await this.setSettingValue.execute({
      userUuid: user.uuid,
      settingName: SettingName.NAMES.ListedAuthorSecrets,
      value: JSON.stringify(authSecrets),
    })

    if (result.isFailed()) {
      this.logger.error(`Could not update listed author secrets for user with uuid ${user.uuid}`)
    }
  }
}
