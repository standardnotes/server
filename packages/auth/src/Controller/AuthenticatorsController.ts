import { HttpResponse, HttpStatusCode } from '@standardnotes/responses'
import { MapperInterface } from '@standardnotes/domain-core'
import { Authenticator } from '../Domain/Authenticator/Authenticator'
import { DeleteAuthenticator } from '../Domain/UseCase/DeleteAuthenticator/DeleteAuthenticator'

import { GenerateAuthenticatorAuthenticationOptions } from '../Domain/UseCase/GenerateAuthenticatorAuthenticationOptions/GenerateAuthenticatorAuthenticationOptions'
import { GenerateAuthenticatorRegistrationOptions } from '../Domain/UseCase/GenerateAuthenticatorRegistrationOptions/GenerateAuthenticatorRegistrationOptions'
import { ListAuthenticators } from '../Domain/UseCase/ListAuthenticators/ListAuthenticators'
import { VerifyAuthenticatorRegistrationResponse } from '../Domain/UseCase/VerifyAuthenticatorRegistrationResponse/VerifyAuthenticatorRegistrationResponse'
import { AuthenticatorHttpProjection } from '../Infra/Http/Projection/AuthenticatorHttpProjection'
import { DeleteAuthenticatorRequestParams } from '../Infra/Http/Request/DeleteAuthenticatorRequestParams'
import { GenerateAuthenticatorAuthenticationOptionsRequestParams } from '../Infra/Http/Request/GenerateAuthenticatorAuthenticationOptionsRequestParams'
import { GenerateAuthenticatorRegistrationOptionsRequestParams } from '../Infra/Http/Request/GenerateAuthenticatorRegistrationOptionsRequestParams'
import { ListAuthenticatorsRequestParams } from '../Infra/Http/Request/ListAuthenticatorsRequestParams'
import { VerifyAuthenticatorRegistrationResponseRequestParams } from '../Infra/Http/Request/VerifyAuthenticatorRegistrationResponseRequestParams'
import { DeleteAuthenticatorResponseBody } from '../Infra/Http/Response/DeleteAuthenticatorResponseBody'
import { GenerateAuthenticatorAuthenticationOptionsResponseBody } from '../Infra/Http/Response/GenerateAuthenticatorAuthenticationOptionsResponseBody'
import { GenerateAuthenticatorRegistrationOptionsResponseBody } from '../Infra/Http/Response/GenerateAuthenticatorRegistrationOptionsResponseBody'
import { ListAuthenticatorsResponseBody } from '../Infra/Http/Response/ListAuthenticatorsResponseBody'
import { VerifyAuthenticatorRegistrationResponseResponseBody } from '../Infra/Http/Response/VerifyAuthenticatorRegistrationResponseResponseBody'

export class AuthenticatorsController {
  constructor(
    private generateAuthenticatorRegistrationOptions: GenerateAuthenticatorRegistrationOptions,
    private verifyAuthenticatorRegistrationResponse: VerifyAuthenticatorRegistrationResponse,
    private generateAuthenticatorAuthenticationOptions: GenerateAuthenticatorAuthenticationOptions,
    private listAuthenticators: ListAuthenticators,
    private deleteAuthenticator: DeleteAuthenticator,
    private authenticatorHttpMapper: MapperInterface<Authenticator, AuthenticatorHttpProjection>,
  ) {}

  async list(params: ListAuthenticatorsRequestParams): Promise<HttpResponse<ListAuthenticatorsResponseBody>> {
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

  async delete(params: DeleteAuthenticatorRequestParams): Promise<HttpResponse<DeleteAuthenticatorResponseBody>> {
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
  ): Promise<HttpResponse<GenerateAuthenticatorRegistrationOptionsResponseBody>> {
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
  ): Promise<HttpResponse<VerifyAuthenticatorRegistrationResponseResponseBody>> {
    const result = await this.verifyAuthenticatorRegistrationResponse.execute({
      userUuid: params.userUuid,
      attestationResponse: params.attestationResponse,
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
  ): Promise<HttpResponse<GenerateAuthenticatorAuthenticationOptionsResponseBody>> {
    const result = await this.generateAuthenticatorAuthenticationOptions.execute({
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
}
