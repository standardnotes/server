import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodesDTO } from './GenerateRecoveryCodesDTO'

export class GenerateRecoveryCodes implements UseCaseInterface<string> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private settingService: SettingServiceInterface,
    private cryptoNode: CryptoNode,
  ) {}
  async execute(dto: GenerateRecoveryCodesDTO): Promise<Result<string>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not generate recovery codes: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid.value)
    if (user === null) {
      return Result.fail('Could not generate recovery codes: user not found')
    }

    const randomKey = await this.cryptoNode.generateRandomKey(160)
    const recoveryCodesSplit = randomKey.toUpperCase().match(/.{1,4}/g)
    if (!recoveryCodesSplit) {
      return Result.fail('Could not generate recovery codes: random key is invalid')
    }

    const recoveryCodes = recoveryCodesSplit.join(' ')

    await this.settingService.createOrReplace({
      user,
      props: {
        name: SettingName.RecoveryCodes,
        unencryptedValue: recoveryCodes,
        serverEncryptionVersion: EncryptionVersion.Default,
        sensitive: false,
      },
    })

    return Result.ok(recoveryCodes)
  }
}
