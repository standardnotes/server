import { HttpStatusCode } from '@standardnotes/api'
import { MapperInterface } from '@standardnotes/domain-core'
import { Authenticator } from '../Domain/Authenticator/Authenticator'
import { DeleteAuthenticator } from '../Domain/UseCase/DeleteAuthenticator/DeleteAuthenticator'

import { GenerateAuthenticatorAuthenticationOptions } from '../Domain/UseCase/GenerateAuthenticatorAuthenticationOptions/GenerateAuthenticatorAuthenticationOptions'
import { GenerateAuthenticatorRegistrationOptions } from '../Domain/UseCase/GenerateAuthenticatorRegistrationOptions/GenerateAuthenticatorRegistrationOptions'
import { ListAuthenticators } from '../Domain/UseCase/ListAuthenticators/ListAuthenticators'
import { VerifyAuthenticatorAuthenticationResponse } from '../Domain/UseCase/VerifyAuthenticatorAuthenticationResponse/VerifyAuthenticatorAuthenticationResponse'
import { VerifyAuthenticatorRegistrationResponse } from '../Domain/UseCase/VerifyAuthenticatorRegistrationResponse/VerifyAuthenticatorRegistrationResponse'
import { AuthenticatorHttpProjection } from '../Infra/Http/Projection/AuthenticatorHttpProjection'
import { DeleteAuthenticatorRequestParams } from '../Infra/Http/Request/DeleteAuthenticatorRequestParams'
import { GenerateAuthenticatorAuthenticationOptionsRequestParams } from '../Infra/Http/Request/GenerateAuthenticatorAuthenticationOptionsRequestParams'
import { GenerateAuthenticatorRegistrationOptionsRequestParams } from '../Infra/Http/Request/GenerateAuthenticatorRegistrationOptionsRequestParams'
import { ListAuthenticatorsRequestParams } from '../Infra/Http/Request/ListAuthenticatorsRequestParams'
import { VerifyAuthenticatorAuthenticationResponseRequestParams } from '../Infra/Http/Request/VerifyAuthenticatorAuthenticationResponseRequestParams'
import { VerifyAuthenticatorRegistrationResponseRequestParams } from '../Infra/Http/Request/VerifyAuthenticatorRegistrationResponseRequestParams'
import { DeleteAuthenticatorResponse } from '../Infra/Http/Response/DeleteAuthenticatorResponse'
import { GenerateAuthenticatorAuthenticationOptionsResponse } from '../Infra/Http/Response/GenerateAuthenticatorAuthenticationOptionsResponse'
import { GenerateAuthenticatorRegistrationOptionsResponse } from '../Infra/Http/Response/GenerateAuthenticatorRegistrationOptionsResponse'
import { ListAuthenticatorsResponse } from '../Infra/Http/Response/ListAuthenticatorsResponse'
import { VerifyAuthenticatorAuthenticationResponseResponse } from '../Infra/Http/Response/VerifyAuthenticatorAuthenticationResponseResponse'
import { VerifyAuthenticatorRegistrationResponseResponse } from '../Infra/Http/Response/VerifyAuthenticatorRegistrationResponseResponse'

export class AuthenticatorsController {
  constructor(
    private generateAuthenticatorRegistrationOptions: GenerateAuthenticatorRegistrationOptions,
    private verifyAuthenticatorRegistrationResponse: VerifyAuthenticatorRegistrationResponse,
    private generateAuthenticatorAuthenticationOptions: GenerateAuthenticatorAuthenticationOptions,
    private verifyAuthenticatorAuthenticationResponse: VerifyAuthenticatorAuthenticationResponse,
    private listAuthenticators: ListAuthenticators,
    private deleteAuthenticator: DeleteAuthenticator,
    private authenticatorHttpMapper: MapperInterface<Authenticator, AuthenticatorHttpProjection>,
  ) {}

  async list(params: ListAuthenticatorsRequestParams): Promise<ListAuthenticatorsResponse> {
    const result = await this.listAuthenticators.execute({
      userUuid: params.userUuid,
    })

    return {
      status: HttpStatusCode.Success,
      data: {
        authenticators: result
          .getValue()
          .map((authenticator) => this.authenticatorHttpMapper.toProjection(authenticator)),
      },
    }
  }

  async delete(params: DeleteAuthenticatorRequestParams): Promise<DeleteAuthenticatorResponse> {
    const result = await this.deleteAuthenticator.execute({
      userUuid: params.userUuid,
      authenticatorId: params.authenticatorId,
    })

    return {
      status: HttpStatusCode.Success,
      data: {
        message: result.getValue(),
      },
    }
  }

  async generateRegistrationOptions(
    params: GenerateAuthenticatorRegistrationOptionsRequestParams,
  ): Promise<GenerateAuthenticatorRegistrationOptionsResponse> {
    const result = await this.generateAuthenticatorRegistrationOptions.execute({
      userUuid: params.userUuid,
      username: params.username,
    })

    if (result.isFailed()) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: result.getError(),
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { options: result.getValue() },
    }
  }

  async verifyRegistrationResponse(
    params: VerifyAuthenticatorRegistrationResponseRequestParams,
  ): Promise<VerifyAuthenticatorRegistrationResponseResponse> {
    const result = await this.verifyAuthenticatorRegistrationResponse.execute({
      userUuid: params.userUuid,
      name: params.name,
      registrationCredential: params.registrationCredential,
    })

    if (result.isFailed()) {
      return {
        status: HttpStatusCode.Unauthorized,
        data: {
          error: {
            message: result.getError(),
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { success: result.getValue() },
    }
  }

  async generateAuthenticationOptions(
    params: GenerateAuthenticatorAuthenticationOptionsRequestParams,
  ): Promise<GenerateAuthenticatorAuthenticationOptionsResponse> {
    const result = await this.generateAuthenticatorAuthenticationOptions.execute({
      userUuid: params.userUuid,
    })

    if (result.isFailed()) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: result.getError(),
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { options: result.getValue() },
    }
  }

  async verifyAuthenticationResponse(
    params: VerifyAuthenticatorAuthenticationResponseRequestParams,
  ): Promise<VerifyAuthenticatorAuthenticationResponseResponse> {
    const result = await this.verifyAuthenticatorAuthenticationResponse.execute({
      userUuid: params.userUuid,
      authenticationCredential: params.authenticationCredential,
    })

    if (result.isFailed()) {
      return {
        status: HttpStatusCode.Unauthorized,
        data: {
          error: {
            message: result.getError(),
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { success: result.getValue() },
    }
  }
}
