import { SessionTokenData, TokenDecoderInterface } from '@standardnotes/security'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { AuthenticationMethod } from './AuthenticationMethod'
import { AuthenticationMethodResolverInterface } from './AuthenticationMethodResolverInterface'
import { Logger } from 'winston'
import { Uuid } from '@standardnotes/domain-core'
import { GetSessionFromToken } from '../UseCase/GetSessionFromToken/GetSessionFromToken'

export class AuthenticationMethodResolver implements AuthenticationMethodResolverInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private sessionService: SessionServiceInterface,
    private sessionTokenDecoder: TokenDecoderInterface<SessionTokenData>,
    private fallbackSessionTokenDecoder: TokenDecoderInterface<SessionTokenData>,
    private getSessionFromToken: GetSessionFromToken,
    private logger: Logger,
  ) {}

  async resolve(dto: {
    authTokenFromHeaders: string
    authCookies?: Map<string, string[]>
    requestMetadata: {
      url: string
      method: string
      snjs?: string
      application?: string
      userAgent?: string
      secChUa?: string
    }
  }): Promise<AuthenticationMethod | undefined> {
    let decodedToken: SessionTokenData | undefined = this.sessionTokenDecoder.decodeToken(dto.authTokenFromHeaders)
    if (decodedToken === undefined) {
      this.logger.debug('Could not decode token with primary decoder, trying fallback decoder.')

      decodedToken = this.fallbackSessionTokenDecoder.decodeToken(dto.authTokenFromHeaders)
    }

    if (decodedToken) {
      this.logger.debug('Token decoded successfully. User found.')

      const userUuidOrError = Uuid.create(decodedToken.user_uuid as string)
      if (userUuidOrError.isFailed()) {
        return undefined
      }
      const userUuid = userUuidOrError.getValue()

      this.logger.debug('User utilizing JWT authentication method.', {
        userId: userUuid.value,
      })

      return {
        type: 'jwt',
        user: await this.userRepository.findOneByUuid(userUuid),
        claims: decodedToken,
      }
    }

    const resultOrError = await this.getSessionFromToken.execute(dto)
    if (!resultOrError.isFailed()) {
      const { session, givenTokensWereInCooldown } = resultOrError.getValue()

      this.logger.debug('Token decoded successfully. Session found.')

      const userUuidOrError = Uuid.create(session.userUuid)
      if (userUuidOrError.isFailed()) {
        return undefined
      }
      const userUuid = userUuidOrError.getValue()

      return {
        type: 'session_token',
        user: await this.userRepository.findOneByUuid(userUuid),
        session: session,
        givenTokensWereInCooldown: givenTokensWereInCooldown,
      }
    }

    const revokedSession = await this.sessionService.getRevokedSessionFromToken(dto.authTokenFromHeaders)
    if (revokedSession) {
      this.logger.debug('Token decoded successfully. Revoked session found.')

      return {
        type: 'revoked',
        revokedSession: await this.sessionService.markRevokedSessionAsReceived(revokedSession),
        user: null,
      }
    }

    this.logger.debug('Could not decode token.')

    return undefined
  }
}
