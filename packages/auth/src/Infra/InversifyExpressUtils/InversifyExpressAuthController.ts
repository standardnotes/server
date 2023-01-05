import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { SessionServiceInterface } from '../../Domain/Session/SessionServiceInterface'
import { SignIn } from '../../Domain/UseCase/SignIn'
import { ClearLoginAttempts } from '../../Domain/UseCase/ClearLoginAttempts'
import { VerifyMFA } from '../../Domain/UseCase/VerifyMFA'
import { IncreaseLoginAttempts } from '../../Domain/UseCase/IncreaseLoginAttempts'
import { Logger } from 'winston'
import { GetUserKeyParams } from '../../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { ErrorTag } from '@standardnotes/common'
import { inject } from 'inversify'
import { AuthController } from '../../Controller/AuthController'

@controller('/auth')
export class InversifyExpressAuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.VerifyMFA) private verifyMFA: VerifyMFA,
    @inject(TYPES.SignIn) private signInUseCase: SignIn,
    @inject(TYPES.GetUserKeyParams) private getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.AuthController) private authController: AuthController,
  ) {
    super()
  }

  @httpGet('/params', TYPES.AuthMiddlewareWithoutResponse)
  async params(request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.session) {
      const result = await this.getUserKeyParams.execute({
        email: response.locals.user.email,
        authenticated: true,
        authenticatedUser: response.locals.user,
      })

      return this.json(result.keyParams)
    }

    if (!request.query.email) {
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
      email: <string>request.query.email,
      requestParams: request.query,
      preventOTPFromFurtherUsage: false,
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
      email: <string>request.query.email,
      authenticated: false,
    })

    return this.json(result.keyParams)
  }

  @httpPost('/sign_in', TYPES.LockMiddleware)
  async signIn(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password) {
      this.logger.debug('/auth/sign_in request missing credentials: %O', request.body)

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

    const verifyMFAResponse = await this.verifyMFA.execute({
      email: request.body.email,
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

    const signInResult = await this.signInUseCase.execute({
      apiVersion: request.body.api,
      userAgent: <string>request.headers['user-agent'],
      email: request.body.email,
      password: request.body.password,
      ephemeralSession: request.body.ephemeral ?? false,
    })

    if (!signInResult.success) {
      await this.increaseLoginAttempts.execute({ email: request.body.email })

      return this.json(
        {
          error: {
            message: signInResult.errorMessage,
          },
        },
        signInResult.errorCode ?? 401,
      )
    }

    await this.clearLoginAttempts.execute({ email: request.body.email })

    return this.json(signInResult.authResponse)
  }

  @httpPost('/pkce_params', TYPES.AuthMiddlewareWithoutResponse)
  async pkceParams(request: Request, response: Response): Promise<results.JsonResult> {
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

    if (response.locals.session) {
      const result = await this.getUserKeyParams.execute({
        email: response.locals.user.email,
        authenticated: true,
        authenticatedUser: response.locals.user,
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

  @httpPost('/pkce_sign_in', TYPES.LockMiddleware)
  async pkceSignIn(request: Request): Promise<results.JsonResult> {
    if (!request.body.email || !request.body.password || !request.body.code_verifier) {
      this.logger.debug('/auth/sign_in request missing credentials: %O', request.body)

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
    })

    if (!signInResult.success) {
      await this.increaseLoginAttempts.execute({ email: request.body.email })

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

    return this.json(signInResult.authResponse)
  }

  @httpPost('/recovery/codes', TYPES.ApiGatewayAuthMiddleware)
  async generateRecoveryCodes(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authController.generateRecoveryCodes({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/recovery/login', TYPES.LockMiddleware)
  async recoveryLogin(request: Request): Promise<results.JsonResult> {
    const result = await this.authController.signInWithRecoveryCodes({
      apiVersion: request.body.api,
      userAgent: <string>request.headers['user-agent'],
      codeVerifier: request.body.code_verifier,
      username: request.body.email,
      recoveryCodes: request.body.recovery_codes,
      password: request.body.password,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/recovery/params')
  async recoveryParams(request: Request): Promise<results.JsonResult> {
    const result = await this.authController.recoveryKeyParams({
      apiVersion: request.body.api,
      username: request.body.email,
      codeChallenge: request.body.code_challenge,
      recoveryCodes: request.body.recovery_codes,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/sign_out', TYPES.AuthMiddlewareWithoutResponse)
  async signOut(request: Request, response: Response): Promise<results.JsonResult | void> {
    if (response.locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

    const authorizationHeader = <string>request.headers.authorization

    const userUuid = await this.sessionService.deleteSessionByToken(authorizationHeader.replace('Bearer ', ''))

    if (userUuid !== null) {
      response.setHeader('x-invalidate-cache', userUuid)
    }
    response.status(204).send()
  }

  @httpPost('/')
  async register(request: Request): Promise<results.JsonResult> {
    const response = await this.authController.register({
      ...request.body,
      userAgent: <string>request.headers['user-agent'],
    })

    return this.json(response.data, response.status)
  }
}
