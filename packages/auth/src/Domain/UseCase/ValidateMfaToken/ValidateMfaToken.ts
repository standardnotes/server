import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { inject, injectable } from 'inversify'

import { MfaSecretRepositoryInterface } from '../../Mfa/MfaSecretRepositoryInterface'
import TYPES from '../../../Bootstrap/Types'
import { ValidateMfaTokenDTO } from './ValidateMfaTokenDTO'

@injectable()
export class ValidateMfaToken implements UseCaseInterface<void> {
  constructor(
    @inject(TYPES.Auth_CryptoNode) private cryptoNode: CryptoNode,
    @inject(TYPES.Auth_MfaSecretRepository) private mfaSecretRepository: MfaSecretRepositoryInterface,
  ) {}

  async execute(dto: ValidateMfaTokenDTO): Promise<Result<void>> {
    const { userUuid, totpToken, authTokenVersion } = dto
    try {
      if (authTokenVersion && authTokenVersion < 3) {
        return Result.ok()
      }

      if (!totpToken) {
        return Result.fail('No TOTP token provided.')
      }

      const cachedSecret = await this.mfaSecretRepository.getMfaSecret(userUuid)

      if (!cachedSecret) {
        return Result.fail('No MFA secret found. Please generate a new secret first.')
      }

      const expectedToken = await this.cryptoNode.totpToken(cachedSecret, Date.now(), 6, 30)

      if (totpToken !== expectedToken) {
        return Result.fail('Invalid TOTP token.')
      }

      await this.mfaSecretRepository.deleteMfaSecret(userUuid)

      return Result.ok()
    } catch (error) {
      return Result.fail(`Failed to validate MFA token: ${(error as Error).message}`)
    }
  }
}
