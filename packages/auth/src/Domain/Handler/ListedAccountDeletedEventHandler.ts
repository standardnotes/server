import { DomainEventHandlerInterface, ListedAccountDeletedEvent } from '@standardnotes/domain-events'
import { ListedAuthorSecretsData, SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { SettingServiceInterface } from '../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class ListedAccountDeletedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: ListedAccountDeletedEvent): Promise<void> {
    const user = await this.userRepository.findOneByEmail(event.payload.userEmail)
    if (user === null) {
      this.logger.warn(`Could not find user with email ${event.payload.userEmail}`)

      return
    }

    const listedAuthorSecretsSetting = await this.settingService.findSettingWithDecryptedValue({
      settingName: SettingName.create(SettingName.NAMES.ListedAuthorSecrets).getValue(),
      userUuid: user.uuid,
    })
    if (listedAuthorSecretsSetting === null) {
      this.logger.warn(`Could not find listed secrets setting for user ${user.uuid}`)

      return
    }

    const existingSecrets: ListedAuthorSecretsData = JSON.parse(listedAuthorSecretsSetting.value as string)
    const filteredSecrets = existingSecrets.filter(
      (secret) =>
        secret.authorId !== event.payload.userId ||
        (secret.authorId === event.payload.userId && secret.hostUrl !== event.payload.hostUrl),
    )

    await this.settingService.createOrReplace({
      user,
      props: {
        name: SettingName.NAMES.ListedAuthorSecrets,
        unencryptedValue: JSON.stringify(filteredSecrets),
        sensitive: false,
      },
    })
  }
}
