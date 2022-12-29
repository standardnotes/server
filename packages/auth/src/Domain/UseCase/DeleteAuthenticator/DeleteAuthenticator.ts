import { Result, UniqueEntityId, UseCaseInterface } from '@standardnotes/domain-core'
import { AuthenticatorRepositoryInterface } from '../../Authenticator/AuthenticatorRepositoryInterface'
import { DeleteAuthenticatorDTO } from './DeleteAuthenticatorDTO'

export class DeleteAuthenticator implements UseCaseInterface<string> {
  constructor(private authenticatorRepository: AuthenticatorRepositoryInterface) {}
  async execute(dto: DeleteAuthenticatorDTO): Promise<Result<string>> {
    const authenticator = await this.authenticatorRepository.findById(new UniqueEntityId(dto.authenticatorId))
    if (!authenticator || authenticator.props.userUuid.value !== dto.userUuid) {
      return Result.fail('Authenticator not found')
    }

    await this.authenticatorRepository.remove(authenticator)

    return Result.ok('Authenticator deleted')
  }
}
