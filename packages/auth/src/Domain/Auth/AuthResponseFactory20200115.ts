import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SessionTokenData,
  TokenEncoderInterface,
} from '@standardnotes/security'
import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { SessionBody } from '@standardnotes/responses'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { User } from '../User/User'
import { AuthResponse20161215 } from './AuthResponse20161215'
import { AuthResponse20200115 } from './AuthResponse20200115'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'

@injectable()
export class AuthResponseFactory20200115 extends AuthResponseFactory20190520 {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.KeyParamsFactory) private keyParamsFactory: KeyParamsFactoryInterface,
    @inject(TYPES.UserProjector) userProjector: ProjectorInterface<User>,
    @inject(TYPES.SessionTokenEncoder) protected override tokenEncoder: TokenEncoderInterface<SessionTokenData>,
    @inject(TYPES.Logger) logger: Logger,
  ) {
    super(userProjector, tokenEncoder, logger)
  }

  override async createResponse(dto: {
    user: User
    apiVersion: string
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
  }): Promise<AuthResponse20161215 | AuthResponse20200115> {
    if (!dto.user.supportsSessions()) {
      this.logger.debug(`User ${dto.user.uuid} does not support sessions. Falling back to JWT auth response`)

      return super.createResponse(dto)
    }

    const sessionPayload = await this.createSession(dto)

    this.logger.debug('Created session payload for user %s: %O', dto.user.uuid, sessionPayload)

    return {
      session: sessionPayload,
      key_params: this.keyParamsFactory.create(dto.user, true),
      user: this.userProjector.projectSimple(dto.user) as {
        uuid: Uuid
        email: string
        protocolVersion: ProtocolVersion
      },
    }
  }

  private async createSession(dto: {
    user: User
    apiVersion: string
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
  }): Promise<SessionBody> {
    if (dto.ephemeralSession) {
      return this.sessionService.createNewEphemeralSessionForUser(dto)
    }

    return this.sessionService.createNewSessionForUser(dto)
  }
}
