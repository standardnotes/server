import * as bcrypt from 'bcryptjs'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { Logger } from 'winston'
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
import { EmailLevel, Result, Username } from '@standardnotes/domain-core'
import { getBody, getSubject } from '../Email/UserSignedIn'
import { ApiVersion } from '../Api/ApiVersion'
import { HttpStatusCode } from '@standardnotes/responses'
import { VerifyHumanInteraction } from './VerifyHumanInteraction/VerifyHumanInteraction'
import { LockRepositoryInterface } from '../User/LockRepositoryInterface'

export class SignIn implements UseCaseInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private authResponseFactoryResolver: AuthResponseFactoryResolverInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private sessionService: SessionServiceInterface,
    private pkceRepository: PKCERepositoryInterface,
    private crypter: CrypterInterface,
    private logger: Logger,
    private maxNonCaptchaAttempts: number,
    private lockRepository: LockRepositoryInterface,
    private verifyHumanInteractionUseCase: VerifyHumanInteraction,
  ) {}

  async execute(dto: SignInDTO): Promise<SignInResponse> {
    if (!dto.codeVerifier) {
      return {
        success: false,
        errorMessage: 'Please update your client application.',
        errorCode: HttpStatusCode.Gone,
      }
    }

    const validCodeVerifier = await this.validateCodeVerifier(dto.codeVerifier)
    if (!validCodeVerifier) {
      this.logger.debug('Code verifier does not match')

      return {
        success: false,
        errorMessage: 'Invalid email or password',
      }
    }

    const apiVersionOrError = ApiVersion.create(dto.apiVersion)
    if (apiVersionOrError.isFailed()) {
      return {
        success: false,
        errorMessage: apiVersionOrError.getError(),
      }
    }
    const apiVersion = apiVersionOrError.getValue()

    const usernameOrError = Username.create(dto.email)
    if (usernameOrError.isFailed()) {
      return {
        success: false,
        errorMessage: usernameOrError.getError(),
      }
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)
    const userIdentifier = user?.uuid ?? dto.email

    const humanVerificationBeforeCheckingUsernameAndPasswordResult = await this.checkHumanVerificationIfNeeded(
      userIdentifier,
      dto.hvmToken,
    )
    if (humanVerificationBeforeCheckingUsernameAndPasswordResult.isFailed()) {
      return {
        success: false,
        errorMessage: humanVerificationBeforeCheckingUsernameAndPasswordResult.getError(),
      }
    }

    if (!user) {
      this.logger.debug(`User with email ${dto.email} was not found`)

      return {
        success: false,
        errorMessage: 'Invalid email or password',
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

    const authResponseFactory = this.authResponseFactoryResolver.resolveAuthResponseFactoryVersion(apiVersion)

    await this.sendSignInEmailNotification(user, dto.userAgent)

    const result = await authResponseFactory.createResponse({
      user,
      apiVersion,
      userAgent: dto.userAgent,
      ephemeralSession: dto.ephemeralSession,
      readonlyAccess: false,
      snjs: dto.snjs,
      application: dto.application,
    })

    return {
      success: true,
      result,
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
          userUuid: user.uuid,
        }),
      )
    } catch (error) {
      this.logger.error(`Could not publish sign in event: ${(error as Error).message}`)
    }
  }

  private async checkHumanVerificationIfNeeded(userIdentifier: string, hvmToken?: string): Promise<Result<void>> {
    const numberOfFailedAttempts = await this.lockRepository.getLockCounter(userIdentifier, 'non-captcha')
    const numberOfFailedAttemptsInCaptchaMode = await this.lockRepository.getLockCounter(userIdentifier, 'captcha')

    const isEligibleForNonCaptchaMode =
      numberOfFailedAttemptsInCaptchaMode === 0 && numberOfFailedAttempts < this.maxNonCaptchaAttempts

    if (isEligibleForNonCaptchaMode) {
      return Result.ok()
    }

    return this.verifyHumanInteractionUseCase.execute(hvmToken)
  }
}
