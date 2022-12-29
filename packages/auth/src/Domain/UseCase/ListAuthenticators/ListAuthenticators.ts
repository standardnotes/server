import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { Authenticator } from '../../Authenticator/Authenticator'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { ListAuthenticatorsDTO } from './ListAuthenticatorsDTO'

export class ListAuthenticators implements UseCaseInterface<Authenticator[]> {
  constructor(private authenticatorRepository: AuthenticatorRepositoryInterface) {}
  async execute(dto: ListAuthenticatorsDTO): Promise<Result<Authenticator[]>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Could not list authenticators: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const authenticators = await this.authenticatorRepository.findByUserUuid(userUuid)

    return Result.ok(authenticators)
  }
}
