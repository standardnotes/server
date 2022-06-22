import { DomainEventHandlerInterface, ListedAccountCreatedEvent } from '@standardnotes/domain-events'
import { ListedAuthorSecretsData, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class ListedAccountCreatedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: ListedAccountCreatedEvent): Promise<void> {
    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)
    if (user === null) {
      this.logger.warn(`Could not find user with email ${event.payload.userEmail}`)

      return
    }

    const newSecret = { authorId: event.payload.userId, secret: event.payload.secret, hostUrl: event.payload.hostUrl }

    let authSecrets: ListedAuthorSecretsData = [newSecret]

    const listedAuthorSecretsSetting = await this.settingService.findSettingWithDecryptedValue({
      settingName: SettingName.ListedAuthorSecrets,
      userUuid: user.uuid,
    })
    if (listedAuthorSecretsSetting !== null) {
      const existingSecrets: ListedAuthorSecretsData = JSON.parse(listedAuthorSecretsSetting.value as string)
      existingSecrets.push(newSecret)
      authSecrets = existingSecrets
    }

    await this.settingService.createOrReplace({
      user,
      props: {
        name: SettingName.ListedAuthorSecrets,
        unencryptedValue: JSON.stringify(authSecrets),
        sensitive: false,
      },
    })
  }
}
