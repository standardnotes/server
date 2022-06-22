import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthenticateRequestDTO } from './AuthenticateRequestDTO'
import { AuthenticateRequestResponse } from './AuthenticateRequestResponse'
import { AuthenticateUser } from './AuthenticateUser'
import { AuthenticateUserResponse } from './AuthenticateUserResponse'
import { UseCaseInterface } from './UseCaseInterface'

@injectable()
export class AuthenticateRequest implements UseCaseInterface {
  constructor(
    @inject(TYPES.AuthenticateUser) private authenticateUser: AuthenticateUser,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: AuthenticateRequestDTO): Promise<AuthenticateRequestResponse> {
    if (!dto.authorizationHeader) {
      return {
        success: false,
        responseCode: 401,
        errorTag: 'invalid-auth',
        errorMessage: 'Invalid login credentials.',
      }
    }

    let authenticateResponse: AuthenticateUserResponse
    try {
      authenticateResponse = await this.authenticateUser.execute({
        token: dto.authorizationHeader.replace('Bearer ', ''),
      })
    } catch (error) {
      this.logger.error('Error occurred during authentication of a user %o', error)

      return {
        success: false,
        responseCode: 401,
        errorTag: 'invalid-auth',
        errorMessage: 'Invalid login credentials.',
      }
    }

    if (!authenticateResponse.success) {
      switch (authenticateResponse.failureType) {
        case 'EXPIRED_TOKEN':
          return {
            success: false,
            responseCode: 498,
            errorTag: 'expired-access-token',
            errorMessage: 'The provided access token has expired.',
          }
        case 'INVALID_AUTH':
          return {
            success: false,
            responseCode: 401,
            errorTag: 'invalid-auth',
            errorMessage: 'Invalid login credentials.',
          }
        case 'REVOKED_SESSION':
          return {
            success: false,
            responseCode: 401,
            errorTag: 'revoked-session',
            errorMessage: 'Your session has been revoked.',
          }
      }
    }

    return {
      success: true,
      responseCode: 200,
      session: authenticateResponse.session,
      user: authenticateResponse.user,
    }
  }
}
