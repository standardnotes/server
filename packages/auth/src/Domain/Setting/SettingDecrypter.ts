import { CrypterInterface } from '../Encryption/CrypterInterface'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { Setting } from './Setting'
import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { Uuid } from '@standardnotes/domain-core'
import { SubscriptionSetting } from './SubscriptionSetting'

export class SettingDecrypter implements SettingDecrypterInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private crypter: CrypterInterface,
  ) {}

  async decryptSettingValue(setting: Setting, userUuidString: string): Promise<string | null> {
    return this.decrypt(setting.props.value, setting.props.serverEncryptionVersion, userUuidString)
  }

  async decryptSubscriptionSettingValue(setting: SubscriptionSetting, userUuidString: string): Promise<string | null> {
    return this.decrypt(setting.props.value, setting.props.serverEncryptionVersion, userUuidString)
  }

  private async decrypt(
    value: string | null,
    serverEncryptionVersion: number,
    userUuidString: string,
  ): Promise<string | null> {
    if (value !== null && serverEncryptionVersion === EncryptionVersion.Default) {
      const userUuidOrError = Uuid.create(userUuidString)
      if (userUuidOrError.isFailed()) {
        throw new Error(userUuidOrError.getError())
      }
      const userUuid = userUuidOrError.getValue()

      const user = await this.userRepository.findOneByUuid(userUuid)

      if (user === null) {
        throw new Error(`Could not find user with uuid: ${userUuid.value}`)
      }

      return this.crypter.decryptForUser(value, user)
    }

    return value
  }
}
