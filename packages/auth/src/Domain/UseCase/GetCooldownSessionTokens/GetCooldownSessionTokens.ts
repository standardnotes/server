import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { GetCooldownSessionTokensResponse } from './GetCooldownSessionTokensResponse'
import { GetCooldownSessionTokensDTO } from './GetCooldownSessionTokensDTO'
import { SessionTokensCooldownRepositoryInterface } from '../../Session/SessionTokensCooldownRepositoryInterface'

export class GetCooldownSessionTokens implements UseCaseInterface<GetCooldownSessionTokensResponse> {
  constructor(private sessionTokensCooldownRepository: SessionTokensCooldownRepositoryInterface) {}

  async execute(dto: GetCooldownSessionTokensDTO): Promise<Result<GetCooldownSessionTokensResponse>> {
    const sessionUuidOrError = Uuid.create(dto.sessionUuid)
    if (sessionUuidOrError.isFailed()) {
      return Result.fail(sessionUuidOrError.getError())
    }
    const sessionUuid = sessionUuidOrError.getValue()

    const hashedTokens = await this.sessionTokensCooldownRepository.getHashedTokens(sessionUuid)
    if (!hashedTokens) {
      return Result.fail('No tokens found')
    }

    return Result.ok({
      hashedAccessToken: hashedTokens.hashedAccessToken,
      hashedRefreshToken: hashedTokens.hashedRefreshToken,
    })
  }
}
