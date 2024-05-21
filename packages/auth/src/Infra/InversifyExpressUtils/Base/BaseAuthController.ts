import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { Logger } from 'winston'

import { ClearLoginAttempts } from '../../../Domain/UseCase/ClearLoginAttempts'
import { GetUserKeyParams } from '../../../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { IncreaseLoginAttempts } from '../../../Domain/UseCase/IncreaseLoginAttempts'
import { SignIn } from '../../../Domain/UseCase/SignIn'
import { VerifyMFA } from '../../../Domain/UseCase/VerifyMFA'
import { AuthController } from '../../../Controller/AuthController'
import { ResponseLocals } from '../ResponseLocals'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Session } from '../../../Domain/Session/Session'
import { ErrorTag, HttpStatusCode } from '@standardnotes/responses'
import { Register } from '../../../Domain/UseCase/Register'
import { ProtocolVersion } from '@standardnotes/common'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../../Domain/Event/DomainEventFactoryInterface'
import { SessionServiceInterface } from '../../../Domain/Session/SessionServiceInterface'
import { AuthResponse20161215 } from '../../../Domain/Auth/AuthResponse20161215'
import { VerifyHumanInteraction } from '../../../Domain/UseCase/VerifyHumanInteraction/VerifyHumanInteraction'
import { CookieFactoryInterface } from '../../../Domain/Auth/Cookies/CookieFactoryInterface'
import { SignInWithRecoveryCodes } from '../../../Domain/UseCase/SignInWithRecoveryCodes/SignInWithRecoveryCodes'
import { DeleteSessionByToken } from '../../../Domain/UseCase/DeleteSessionByToken/DeleteSessionByToken'

export class BaseAuthController extends BaseHttpController {
  constructor(
    protected verifyMFA: VerifyMFA,
    protected signInUseCase: SignIn,
    protected getUserKeyParams: GetUserKeyParams,
    protected clearLoginAttempts: ClearLoginAttempts,
    protected increaseLoginAttempts: IncreaseLoginAttempts,
    protected logger: Logger,
    protected authController: AuthController,
    protected registerUser: Register,
    protected domainEventPublisher: DomainEventPublisherInterface,
    protected domainEventFactory: DomainEventFactoryInterface,
    protected sessionService: SessionServiceInterface,
    protected humanVerificationUseCase: VerifyHumanInteraction,
    protected cookieFactory: CookieFactoryInterface,
    protected signInWithRecoveryCodes: SignInWithRecoveryCodes,
    protected deleteSessionByToken: DeleteSessionByToken,
    protected captchaUIUrl: string,
    protected controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.pkceParams', this.pkceParams.bind(this))
      this.controllerContainer.register('auth.pkceSignIn', this.pkceSignIn.bind(this))
      this.controllerContainer.register('auth.users.register', this.register.bind(this))
      this.controllerContainer.register('auth.generateRecoveryCodes', this.generateRecoveryCodes.bind(this))
      this.controllerContainer.register('auth.signInWithRecoveryCodes', this.recoveryLogin.bind(this))
      this.controllerContainer.register('auth.recoveryKeyParams', this.recoveryParams.bind(this))
      this.controllerContainer.register('auth.signOut', this.signOut.bind(this))
    }
  }

  async pkceParams(request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    if (!request.body.code_challenge) {
      return this.json(
        {
          error: {
            message: 'Please provide the code challenge parameter.',
          },
        },
        400,
      )
    }

    if (locals.session) {
      const result = await this.getUserKeyParams.execute({
        email: locals.user.email,
        authenticated: true,
        codeChallenge: request.body.code_challenge as string,
      })

      return this.json(result.keyParams)
    }

    if (!request.body.email) {
      return this.json(
        {
          error: {
            message: 'Please provide an email address.',
          },
        },
        400,
      )
    }

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: <string>request.body.email,
      requestParams: request.body,
      preventOTPFromFurtherUsage: true,
    })

    if (!verifyMFAResponse.success) {
      return this.json(
        {
          error: {
            tag: verifyMFAResponse.errorTag,
            message: verifyMFAResponse.errorMessage,
            payload: verifyMFAResponse.errorPayload,
          },
        },
        401,
      )
    }

    const result = await this.getUserKeyParams.execute({
      email: <string>request.body.email,
      authenticated: false,
      codeChallenge: request.body.code_challenge as string,
    })

    return this.json(result.keyParams)
  }

  async pkceSignIn(request: Request, response: Response): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password || !request.body.code_verifier) {
      this.logger.debug('/auth/pkce_sign_in request missing credentials: %O', request.body)

      return this.json(
        {
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        },
        401,
      )
    }

    const signInResult = await this.signInUseCase.execute({
      apiVersion: request.body.api,
      userAgent: <string>request.headers['user-agent'],
      email: request.body.email,
      password: request.body.password,
      ephemeralSession: request.body.ephemeral ?? false,
      codeVerifier: request.body.code_verifier,
      hvmToken: request.body.hvm_token,
      snjs: request.headers['x-snjs-version'] as string,
      application: request.headers['x-application-version'] as string,
    })

    if (!signInResult.success) {
      const resultOrError = await this.increaseLoginAttempts.execute({ email: request.body.email })
      if (resultOrError.isFailed()) {
        this.logger.error(`Failed to increase login attempts ${resultOrError.getError()}`)
      } else {
        const result = resultOrError.getValue()
        if (result.isNonCaptchaLimitReached) {
          response.setHeader('x-captcha-required', this.captchaUIUrl)
        }
      }

      return this.json(
        {
          error: {
            message: signInResult.errorMessage,
          },
        },
        401,
      )
    }

    await this.clearLoginAttempts.execute({ email: request.body.email })

    if (signInResult.result.response !== undefined) {
      const session = signInResult.result.session as Session
      const user = signInResult.result.response.user

      response.setHeader(
        'Set-Cookie',
        this.cookieFactory.createCookieHeaderValue({
          sessionUuid: session.uuid,
          accessToken: signInResult.result.cookies?.accessToken as string,
          refreshToken: signInResult.result.cookies?.refreshToken as string,
          refreshTokenExpiration: session.refreshExpiration,
        }),
      )

      return this.json({
        session: signInResult.result.response.sessionBody,
        key_params: signInResult.result.response.keyParams,
        user,
      })
    }

    return this.json(signInResult.result.legacyResponse)
  }

  async generateRecoveryCodes(_request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    const result = await this.authController.generateRecoveryCodes({
      userUuid: locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  async recoveryLogin(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.signInWithRecoveryCodes.execute({
      apiVersion: request.body.api_version,
      userAgent: <string>request.headers['user-agent'],
      codeVerifier: request.body.code_verifier,
      username: request.body.username,
      recoveryCodes: request.body.recovery_codes,
      password: request.body.password,
      hvmToken: request.body.hvm_token,
      snjs: request.headers['x-snjs-version'] as string,
      application: request.headers['x-application-version'] as string,
    })

    if (result.isFailed()) {
      this.logger.debug(`Failed to sign in with recovery codes: ${result.getError()}`)

      const increasLoginAttemtpsResultOrError = await this.increaseLoginAttempts.execute({
        email: request.body.username,
      })
      if (increasLoginAttemtpsResultOrError.isFailed()) {
        this.logger.error(`Failed to increase login attempts ${increasLoginAttemtpsResultOrError.getError()}`)
      } else {
        const increasLoginAttemtpsResult = increasLoginAttemtpsResultOrError.getValue()
        if (increasLoginAttemtpsResult.isNonCaptchaLimitReached) {
          response.setHeader('x-captcha-required', this.captchaUIUrl)
        }
      }

      return this.json(
        {
          error: {
            message: 'Invalid login credentials.',
          },
        },
        HttpStatusCode.Unauthorized,
      )
    }

    await this.clearLoginAttempts.execute({ email: request.body.username })

    const signInWithRecoveryCodesResult = result.getValue()

    return this.json({
      session: signInWithRecoveryCodesResult.sessionBody,
      key_params: signInWithRecoveryCodesResult.keyParams,
      user: signInWithRecoveryCodesResult.user,
    })
  }

  async recoveryParams(request: Request): Promise<results.JsonResult> {
    const result = await this.authController.recoveryKeyParams({
      apiVersion: request.body.api_version,
      username: request.body.username,
      codeChallenge: request.body.code_challenge,
      recoveryCodes: request.body.recovery_codes,
    })

    return this.json(result.data, result.status)
  }

  async signOut(request: Request, response: Response): Promise<results.JsonResult | void> {
    const locals = response.locals as ResponseLocals

    if (locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        HttpStatusCode.Unauthorized,
      )
    }

    const authCookies = new Map<string, string[]>()
    request.headers.cookie?.split(';').forEach((cookie) => {
      const parts = cookie.split('=')
      if (parts.length === 2 && parts[0].trim().startsWith('access_token_')) {
        const existingCookies = authCookies.get(parts[0].trim())
        if (existingCookies) {
          existingCookies.push(parts[1].trim())
          authCookies.set(parts[0].trim(), existingCookies)
        } else {
          authCookies.set(parts[0].trim(), [parts[1].trim()])
        }
      }
    })

    const authTokenFromHeaders = (request.headers.authorization as string).replace('Bearer ', '')

    const resultOrError = await this.deleteSessionByToken.execute({
      authTokenFromHeaders,
      authCookies,
      requestMetadata: {
        snjs: request.headers['x-snjs-version'] as string,
        application: request.headers['x-application-version'] as string,
        url: request.headers['x-origin-url'] as string,
        method: request.headers['x-origin-method'] as string,
        userAgent: request.headers['x-origin-user-agent'] as string,
        secChUa: request.headers['x-origin-sec-ch-ua'] as string,
      },
    })
    if (resultOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: 'Invalid session token.',
          },
        },
        HttpStatusCode.Unauthorized,
      )
    }
    const session = resultOrError.getValue()

    response.setHeader(
      'Set-Cookie',
      this.cookieFactory.createCookieHeaderValue({
        sessionUuid: session.uuid,
        accessToken: '0',
        refreshToken: '0',
        refreshTokenExpiration: new Date(1),
      }),
    )

    if (session.userUuid !== null) {
      response.setHeader('x-invalidate-cache', session.userUuid)
    }

    return this.json({}, HttpStatusCode.NoContent)
  }

  async register(request: Request, response: Response): Promise<results.JsonResult> {
    const hvmToken = request.body.hvm_token
    const humanVerificationResult = await this.humanVerificationUseCase.execute(hvmToken)

    if (humanVerificationResult.isFailed()) {
      return this.json(
        {
          error: {
            message: humanVerificationResult.getError(),
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    if (!request.body.email || !request.body.password) {
      return this.json(
        {
          error: {
            message: 'Please enter an email and a password to register.',
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    const registerResult = await this.registerUser.execute({
      email: request.body.email,
      password: request.body.password,
      updatedWithUserAgent: request.headers['user-agent'] as string,
      apiVersion: request.body.api,
      ephemeralSession: request.body.ephemeral,
      pwNonce: request.body.pw_nonce,
      kpOrigination: request.body.origination,
      kpCreated: request.body.created,
      version: request.body.version,
      snjs: request.headers['x-snjs-version'] as string,
      application: request.headers['x-application-version'] as string,
    })

    if (!registerResult.success) {
      return this.json(
        {
          error: {
            message: registerResult.errorMessage,
          },
        },
        HttpStatusCode.BadRequest,
      )
    }

    const registeredUser = registerResult.result.response
      ? registerResult.result.response.user
      : (registerResult.result.legacyResponse as AuthResponse20161215).user

    await this.clearLoginAttempts.execute({ email: registeredUser.email })

    await this.domainEventPublisher.publish(
      this.domainEventFactory.createUserRegisteredEvent({
        userUuid: registeredUser.uuid,
        email: registeredUser.email,
        protocolVersion: registeredUser.protocolVersion as ProtocolVersion,
      }),
    )

    if (registerResult.result.response === undefined) {
      return this.json(registerResult.result.legacyResponse)
    }

    const session = registerResult.result.session as Session

    response.setHeader(
      'Set-Cookie',
      this.cookieFactory.createCookieHeaderValue({
        sessionUuid: session.uuid,
        accessToken: registerResult.result.cookies?.accessToken as string,
        refreshToken: registerResult.result.cookies?.refreshToken as string,
        refreshTokenExpiration: session.refreshExpiration,
      }),
    )

    return this.json({
      session: registerResult.result.response.sessionBody,
      key_params: registerResult.result.response.keyParams,
      user: registeredUser,
    })
  }
}
