import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SessionTokenData,
  TokenEncoderInterface,
} from '@standardnotes/security'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { SimpleUserProjection } from '../../Projection/SimpleUserProjection'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { User } from '../User/User'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'

import { SessionCreationResult } from '../Session/SessionCreationResult'
import { AuthResponseCreationResult } from './AuthResponseCreationResult'
import { ApiVersion } from '../Api/ApiVersion'

@injectable()
export class AuthResponseFactory20200115 extends AuthResponseFactory20190520 {
  constructor(
    @inject(TYPES.Auth_SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.Auth_KeyParamsFactory) private keyParamsFactory: KeyParamsFactoryInterface,
    @inject(TYPES.Auth_UserProjector) userProjector: ProjectorInterface<User>,
    @inject(TYPES.Auth_SessionTokenEncoder) protected override tokenEncoder: TokenEncoderInterface<SessionTokenData>,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_Logger) logger: Logger,
  ) {
    super(userProjector, tokenEncoder, logger)
  }

  override async createResponse(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<AuthResponseCreationResult> {
    if (!dto.user.supportsSessions()) {
      this.logger.debug(`User ${dto.user.uuid} does not support sessions. Falling back to JWT auth response`)

      return super.createResponse(dto)
    }

    const sessionCreationResult = await this.createSession(dto)

    this.logger.debug('Created session payload for user', {
      userId: dto.user.uuid,
      session: sessionCreationResult,
    })

    return {
      response: {
        sessionBody: sessionCreationResult.sessionHttpRepresentation,
        keyParams: this.keyParamsFactory.create(dto.user, true),
        user: this.userProjector.projectSimple(dto.user) as SimpleUserProjection,
      },
      session: sessionCreationResult.session,
      cookies: sessionCreationResult.sessionCookieRepresentation,
    }
  }

  private async createSession(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult> {
    if (dto.ephemeralSession) {
      return this.sessionService.createNewEphemeralSessionForUser(dto)
    }

    const sessionCreationResult = await this.sessionService.createNewSessionForUser(dto)

    try {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createSessionCreatedEvent({ userUuid: dto.user.uuid }),
      )
    } catch (error) {
      this.logger.error(`Failed to publish session created event: ${(error as Error).message}`)
    }

    return sessionCreationResult
  }
}
