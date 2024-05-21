import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { CooldownSessionTokensDTO } from './CooldownSessionTokensDTO'
import { SessionTokensCooldownRepositoryInterface } from '../../Session/SessionTokensCooldownRepositoryInterface'

export class CooldownSessionTokens implements UseCaseInterface<void> {
  constructor(
    private cooldownPeriodInSeconds: number,
    private sessionTokensCooldownRepository: SessionTokensCooldownRepositoryInterface,
  ) {}

  async execute(dto: CooldownSessionTokensDTO): Promise<Result<void>> {
    const sessionUuidOrError = Uuid.create(dto.sessionUuid)
    if (sessionUuidOrError.isFailed()) {
      return Result.fail(sessionUuidOrError.getError())
    }
    const sessionUuid = sessionUuidOrError.getValue()

    await this.sessionTokensCooldownRepository.setCooldown({
      sessionUuid,
      hashedAccessToken: dto.hashedAccessToken,
      hashedRefreshToken: dto.hashedRefreshToken,
      cooldownPeriodInSeconds: this.cooldownPeriodInSeconds,
    })

    return Result.ok()
  }
}
