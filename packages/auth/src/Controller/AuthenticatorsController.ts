import { HttpStatusCode } from '@standardnotes/api'

import { GenerateAuthenticatorAuthenticationOptions } from '../Domain/UseCase/GenerateAuthenticatorAuthenticationOptions/GenerateAuthenticatorAuthenticationOptions'
import { GenerateAuthenticatorRegistrationOptions } from '../Domain/UseCase/GenerateAuthenticatorRegistrationOptions/GenerateAuthenticatorRegistrationOptions'
import { VerifyAuthenticatorAuthenticationResponse } from '../Domain/UseCase/VerifyAuthenticatorAuthenticationResponse/VerifyAuthenticatorAuthenticationResponse'
import { VerifyAuthenticatorRegistrationResponse } from '../Domain/UseCase/VerifyAuthenticatorRegistrationResponse/VerifyAuthenticatorRegistrationResponse'
import { GenerateAuthenticatorAuthenticationOptionsRequestParams } from '../Infra/Http/Request/GenerateAuthenticatorAuthenticationOptionsRequestParams'
import { GenerateAuthenticatorRegistrationOptionsRequestParams } from '../Infra/Http/Request/GenerateAuthenticatorRegistrationOptionsRequestParams'
import { VerifyAuthenticatorAuthenticationResponseRequestParams } from '../Infra/Http/Request/VerifyAuthenticatorAuthenticationResponseRequestParams'
import { VerifyAuthenticatorRegistrationResponseRequestParams } from '../Infra/Http/Request/VerifyAuthenticatorRegistrationResponseRequestParams'
import { GenerateAuthenticatorAuthenticationOptionsResponse } from '../Infra/Http/Response/GenerateAuthenticatorAuthenticationOptionsResponse'
import { GenerateAuthenticatorRegistrationOptionsResponse } from '../Infra/Http/Response/GenerateAuthenticatorRegistrationOptionsResponse'
import { VerifyAuthenticatorAuthenticationResponseResponse } from '../Infra/Http/Response/VerifyAuthenticatorAuthenticationResponseResponse'
import { VerifyAuthenticatorRegistrationResponseResponse } from '../Infra/Http/Response/VerifyAuthenticatorRegistrationResponseResponse'

export class AuthenticatorsController {
  constructor(
    private generateAuthenticatorRegistrationOptions: GenerateAuthenticatorRegistrationOptions,
    private verifyAuthenticatorRegistrationResponse: VerifyAuthenticatorRegistrationResponse,
    private generateAuthenticatorAuthenticationOptions: GenerateAuthenticatorAuthenticationOptions,
    private verifyAuthenticatorAuthenticationResponse: VerifyAuthenticatorAuthenticationResponse,
  ) {}

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
