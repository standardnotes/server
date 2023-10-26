import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GenerateRecoveryCodesDTO } from './GenerateRecoveryCodesDTO'
import { SetSettingValue } from '../SetSettingValue/SetSettingValue'

export class GenerateRecoveryCodes implements UseCaseInterface<string> {
  constructor(
    private userRepository: UserRepositoryInterface,
    private setSettingValue: SetSettingValue,
    private cryptoNode: CryptoNode,
  ) {}

  async execute(dto: GenerateRecoveryCodesDTO): Promise<Result<string>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not generate recovery codes: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (user === null) {
      return Result.fail('Could not generate recovery codes: user not found')
    }

    const randomKey = await this.cryptoNode.generateRandomKey(160)
    const recoveryCodesSplit = randomKey.toUpperCase().match(/.{1,4}/g)
    if (!recoveryCodesSplit) {
      return Result.fail('Could not generate recovery codes: random key is invalid')
    }

    const recoveryCodes = recoveryCodesSplit.join(' ')

    const result = await this.setSettingValue.execute({
      settingName: SettingName.NAMES.RecoveryCodes,
      value: recoveryCodes,
      userUuid: user.uuid,
    })
    if (result.isFailed()) {
      return Result.fail(`Could not generate recovery codes: ${result.getError()}`)
    }

    return Result.ok(recoveryCodes)
  }
}
