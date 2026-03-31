import { inject, injectable } from 'inversify'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { Logger } from 'winston'
import { Result, SettingName, UseCaseInterface } from '@standardnotes/domain-core'

import { GetMfaSecretDto } from './GetMfaSecretDto'
import { MfaSecretRepositoryInterface } from '../../Mfa/MfaSecretRepositoryInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import TYPES from '../../../Bootstrap/Types'

@injectable()
export class GetMfaSecret implements UseCaseInterface<{ secret: string }> {
  constructor(
    @inject(TYPES.Auth_CryptoNode) private cryptoNode: CryptoNode,
    @inject(TYPES.Auth_MfaSecretRepository) private mfaSecretRepository: MfaSecretRepositoryInterface,
    @inject(TYPES.Auth_SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async execute(dto: GetMfaSecretDto): Promise<Result<{ secret: string }>> {
    const { userUuid } = dto

    try {
      const existingMfaSetting = await this.settingRepository.findLastByNameAndUserUuid(
        SettingName.NAMES.MfaSecret,
        userUuid,
      )

      if (existingMfaSetting && existingMfaSetting.props.value !== null) {
        return Result.fail('Failed to generate MFA secret.')
      }

      const cachedSecret = await this.mfaSecretRepository.getMfaSecret(userUuid)

      if (cachedSecret) {
        this.logger.debug(`Retrieved cached MFA secret for user ${userUuid}`)
        return Result.ok({ secret: cachedSecret })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newSecret = await (this.cryptoNode as any).generateOtpSecret()

      await this.mfaSecretRepository.setMfaSecret(userUuid, newSecret, 300)

      this.logger.debug(`Generated new MFA secret for user ${userUuid}`)
      return Result.ok({ secret: newSecret })
    } catch (error) {
      this.logger.error(`Failed to generate MFA secret for user ${userUuid}: ${String(error)}`)
      return Result.fail('Failed to generate MFA secret.')
    }
  }
}
