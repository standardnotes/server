import * as dayjs from 'dayjs'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { RefreshSessionTokenResponse } from './RefreshSessionTokenResponse'
import { RefreshSessionTokenDTO } from './RefreshSessionTokenDTO'

@injectable()
export class RefreshSessionToken {
  constructor(@inject(TYPES.SessionService) private sessionService: SessionServiceInterface) {}

  async execute(dto: RefreshSessionTokenDTO): Promise<RefreshSessionTokenResponse> {
    const session = await this.sessionService.getSessionFromToken(dto.accessToken)
    if (!session) {
      return {
        success: false,
        errorTag: 'invalid-parameters',
        errorMessage: 'The provided parameters are not valid.',
      }
    }

    if (!this.sessionService.isRefreshTokenValid(session, dto.refreshToken)) {
      return {
        success: false,
        errorTag: 'invalid-refresh-token',
        errorMessage: 'The refresh token is not valid.',
      }
    }

    if (session.refreshExpiration < dayjs.utc().toDate()) {
      return {
        success: false,
        errorTag: 'expired-refresh-token',
        errorMessage: 'The refresh token has expired.',
      }
    }

    const sessionPayload = await this.sessionService.refreshTokens(session)

    return {
      success: true,
      sessionPayload,
      userUuid: session.userUuid,
    }
  }
}
