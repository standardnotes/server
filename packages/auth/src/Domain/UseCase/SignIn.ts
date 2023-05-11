import * as bcrypt from 'bcryptjs'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { AuthResponseFactoryResolverInterface } from '../Auth/AuthResponseFactoryResolverInterface'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SignInDTO } from './SignInDTO'
import { SignInResponse } from './SignInResponse'
import { UseCaseInterface } from './UseCaseInterface'
import { PKCERepositoryInterface } from '../User/PKCERepositoryInterface'
import { CrypterInterface } from '../Encryption/CrypterInterface'
import { SignInDTOV2Challenged } from './SignInDTOV2Challenged'
import { leftVersionGreaterThanOrEqualToRight, ProtocolVersion } from '@standardnotes/common'
import { HttpStatusCode } from '@standardnotes/responses'
import { EmailLevel, Username } from '@standardnotes/domain-core'
import { getBody, getSubject } from '../Email/UserSignedIn'

@injectable()
export class SignIn implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_AuthResponseFactoryResolver)
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    @inject(TYPES.Auth_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.Auth_PKCERepository) private pkceRepository: PKCERepositoryInterface,
    @inject(TYPES.Auth_Crypter) private crypter: CrypterInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  async execute(dto: SignInDTO): Promise<SignInResponse> {
    const performingCodeChallengedSignIn = this.isCodeChallengedVersion(dto)
    if (performingCodeChallengedSignIn) {
      const validCodeVerifier = await this.validateCodeVerifier(dto.codeVerifier)
      if (!validCodeVerifier) {
        this.logger.debug('Code verifier does not match')

        return {
          success: false,
          errorMessage: 'Invalid email or password',
        }
      }
    }

    const usernameOrError = Username.create(dto.email)
    if (usernameOrError.isFailed()) {
      return {
        success: false,
        errorMessage: usernameOrError.getError(),
      }
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (!user) {
      this.logger.debug(`User with email ${dto.email} was not found`)

      return {
        success: false,
        errorMessage: 'Invalid email or password',
      }
    }

    const userVersionIs004OrGreater = leftVersionGreaterThanOrEqualToRight(
      user.version as ProtocolVersion,
      ProtocolVersion.V004,
    )

    if (userVersionIs004OrGreater && !performingCodeChallengedSignIn) {
      return {
        success: false,
        errorMessage: 'Please update your client application.',
        errorCode: HttpStatusCode.Gone,
      }
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.encryptedPassword)
    if (!passwordMatches) {
      this.logger.debug('Password does not match')

      return {
        success: false,
        errorMessage: 'Invalid email or password',
      }
    }

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(dto.apiVersion)

    await this.sendSignInEmailNotification(user, dto.userAgent)

    return {
      success: true,
      authResponse: await authResponseFactory.createResponse({
        user,
        apiVersion: dto.apiVersion,
        userAgent: dto.userAgent,
        ephemeralSession: dto.ephemeralSession,
        readonlyAccess: false,
      }),
    }
  }

  private async validateCodeVerifier(codeVerifier: string): Promise<boolean> {
    const codeChallenge = this.crypter.base64URLEncode(this.crypter.sha256Hash(codeVerifier))

    const matchingCodeChallengeWasPresentAndRemoved = await this.pkceRepository.removeCodeChallenge(codeChallenge)

    return matchingCodeChallengeWasPresentAndRemoved
  }

  private async sendSignInEmailNotification(user: User, userAgent: string): Promise<void> {
    try {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createEmailRequestedEvent({
          userEmail: user.email,
          level: EmailLevel.LEVELS.SignIn,
          body: getBody(
            user.email,
            this.sessionService.getOperatingSystemInfoFromUserAgent(userAgent),
            this.sessionService.getBrowserInfoFromUserAgent(userAgent),
            new Date(),
          ),
          messageIdentifier: 'SIGN_IN',
          subject: getSubject(user.email),
        }),
      )
    } catch (error) {
      this.logger.error(`Could not publish sign in event: ${(error as Error).message}`)
    }
  }

  private isCodeChallengedVersion(dto: SignInDTO): dto is SignInDTOV2Challenged {
    return (dto as SignInDTOV2Challenged).codeVerifier !== undefined
  }
}
