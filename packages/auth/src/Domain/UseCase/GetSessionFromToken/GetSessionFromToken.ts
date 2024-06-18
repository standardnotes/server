import * as crypto from 'crypto'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import { Session } from '../../Session/Session'
import { GetSessionFromTokenDTO } from './GetSessionFromTokenDTO'
import { SessionService } from '../../Session/SessionService'
import { SessionRepositoryInterface } from '../../Session/SessionRepositoryInterface'
import { EphemeralSessionRepositoryInterface } from '../../Session/EphemeralSessionRepositoryInterface'
import { Logger } from 'winston'
import { GetSessionFromTokenResult } from './GetSessionFromTokenResult'
import { GetCooldownSessionTokens } from '../GetCooldownSessionTokens/GetCooldownSessionTokens'

export class GetSessionFromToken implements UseCaseInterface<GetSessionFromTokenResult> {
  constructor(
    private sessionRepository: SessionRepositoryInterface,
    private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
    private getCooldownSessionTokens: GetCooldownSessionTokens,
    private logger: Logger,
  ) {}

  async execute(dto: GetSessionFromTokenDTO): Promise<Result<GetSessionFromTokenResult>> {
    const tokenParts = dto.authTokenFromHeaders.split(':')
    const tokenVersion = parseInt(tokenParts[0])

    let accessTokens: string[] = []
    let isSessionEphemeral = false
    let retrievedSession = undefined
    switch (tokenVersion) {
      case SessionService.SESSION_TOKEN_VERSION: {
        if (!tokenParts[2]) {
          return Result.fail('Invalid token')
        }

        accessTokens = [tokenParts[2]]

        const sessionUuid = tokenParts[1]

        const { session, isEphemeral } = await this.getSession(sessionUuid)
        isSessionEphemeral = isEphemeral

        if (!session || session.version === SessionService.COOKIE_BASED_SESSION_VERSION) {
          return Result.fail('Invalid token')
        }

        retrievedSession = session

        break
      }
      case SessionService.COOKIE_SESSION_TOKEN_VERSION: {
        const privateIdentifier = tokenParts[1]
        if (!privateIdentifier) {
          return Result.fail('Invalid token')
        }

        const { session, isEphemeral } = await this.getSessionByPrivateIdentifier(privateIdentifier)
        isSessionEphemeral = isEphemeral

        if (!session || session.version === SessionService.HEADER_BASED_SESSION_VERSION) {
          return Result.fail('Invalid token')
        }

        retrievedSession = session

        if (!dto.authCookies || dto.authCookies.size === 0) {
          /* istanbul ignore next */
          this.logger.error('No cookies provided for cookie-based session token.', {
            userId: session.userUuid,
            sessionUuid: session.uuid,
            snjs: dto.requestMetadata.snjs,
            application: dto.requestMetadata.application,
            url: dto.requestMetadata.url,
            method: dto.requestMetadata.method,
            userAgent: session.userAgent,
            secChUa: session.userAgent ? dto.requestMetadata.secChUa : undefined,
          })

          return Result.fail('Invalid token')
        }

        const accessTokensFromAuthCookies = dto.authCookies?.get(`access_token_${session.uuid}`)
        if (accessTokensFromAuthCookies === undefined) {
          return Result.fail('Invalid token')
        }

        accessTokens = accessTokensFromAuthCookies

        break
      }
    }

    /* istanbul ignore next */
    if (accessTokens.length === 0 || !retrievedSession) {
      return Result.fail('Invalid token')
    }

    const currentSessionTokensMatching = this.areTokensMatching(accessTokens, retrievedSession.hashedAccessToken)
    if (currentSessionTokensMatching) {
      return Result.ok({ session: retrievedSession, isEphemeral: isSessionEphemeral, givenTokensWereInCooldown: false })
    }

    const cooldownTokensResult = await this.getCooldownSessionTokens.execute({ sessionUuid: retrievedSession.uuid })
    if (!cooldownTokensResult.isFailed()) {
      const cooldownTokens = cooldownTokensResult.getValue()
      if (this.areTokensMatching(accessTokens, cooldownTokens.hashedAccessToken)) {
        return Result.ok({
          session: retrievedSession,
          isEphemeral: isSessionEphemeral,
          givenTokensWereInCooldown: true,
          cooldownHashedRefreshToken: cooldownTokens.hashedRefreshToken,
        })
      }
    }

    return Result.fail('Session not found')
  }

  private areTokensMatching(inputTokens: string[], hashedToken: string): boolean {
    for (const inputToken of inputTokens) {
      const hashedInputToken = crypto.createHash('sha256').update(inputToken).digest('hex')

      const areMatching = crypto.timingSafeEqual(Buffer.from(hashedToken), Buffer.from(hashedInputToken))

      if (areMatching) {
        return true
      }
    }

    return false
  }

  private async getSession(uuid: string): Promise<{
    session: Session | null
    isEphemeral: boolean
  }> {
    let session = await this.ephemeralSessionRepository.findOneByUuid(uuid)
    let isEphemeral = true

    if (!session) {
      session = await this.sessionRepository.findOneByUuid(uuid)
      isEphemeral = false
    }

    return { session, isEphemeral }
  }

  private async getSessionByPrivateIdentifier(privateIdentifier: string): Promise<{
    session: Session | null
    isEphemeral: boolean
  }> {
    let session = await this.ephemeralSessionRepository.findOneByPrivateIdentifier(privateIdentifier)
    let isEphemeral = true

    if (!session) {
      session = await this.sessionRepository.findOneByPrivateIdentifier(privateIdentifier)
      isEphemeral = false
    }

    return { session, isEphemeral }
  }
}
