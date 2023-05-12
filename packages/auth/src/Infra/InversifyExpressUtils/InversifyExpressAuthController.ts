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
import { SignIn } from '../../Domain/UseCase/SignIn'
import { ClearLoginAttempts } from '../../Domain/UseCase/ClearLoginAttempts'
import { VerifyMFA } from '../../Domain/UseCase/VerifyMFA'
import { IncreaseLoginAttempts } from '../../Domain/UseCase/IncreaseLoginAttempts'
import { Logger } from 'winston'
import { GetUserKeyParams } from '../../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { inject } from 'inversify'
import { AuthController } from '../../Controller/AuthController'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

@controller('/auth')
export class InversifyExpressAuthController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_VerifyMFA) private verifyMFA: VerifyMFA,
    @inject(TYPES.Auth_SignIn) private signInUseCase: SignIn,
    @inject(TYPES.Auth_GetUserKeyParams) private getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.Auth_ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Auth_IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Auth_Logger) private logger: Logger,
    @inject(TYPES.Auth_AuthController) private authController: AuthController,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.params', this.params.bind(this))
    this.controllerContainer.register('auth.signIn', this.signIn.bind(this))
    this.controllerContainer.register('auth.pkceParams', this.pkceParams.bind(this))
    this.controllerContainer.register('auth.pkceSignIn', this.pkceSignIn.bind(this))
  }

  @httpGet('/params', TYPES.Auth_AuthMiddlewareWithoutResponse)
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

  @httpPost('/sign_in', TYPES.Auth_LockMiddleware)
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

  @httpPost('/pkce_params', TYPES.Auth_AuthMiddlewareWithoutResponse)
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

  @httpPost('/pkce_sign_in', TYPES.Auth_LockMiddleware)
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

  @httpPost('/recovery/codes', TYPES.Auth_ApiGatewayAuthMiddleware)
  async generateRecoveryCodes(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authController.generateRecoveryCodes({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/recovery/login', TYPES.Auth_LockMiddleware)
  async recoveryLogin(request: Request): Promise<results.JsonResult> {
    const result = await this.authController.signInWithRecoveryCodes({
      apiVersion: request.body.api_version,
      userAgent: <string>request.headers['user-agent'],
      codeVerifier: request.body.code_verifier,
      username: request.body.username,
      recoveryCodes: request.body.recovery_codes,
      password: request.body.password,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/recovery/params')
  async recoveryParams(request: Request): Promise<results.JsonResult> {
    const result = await this.authController.recoveryKeyParams({
      apiVersion: request.body.api_version,
      username: request.body.username,
      codeChallenge: request.body.code_challenge,
      recoveryCodes: request.body.recovery_codes,
    })

    return this.json(result.data, result.status)
  }

  @httpPost('/sign_out', TYPES.Auth_AuthMiddlewareWithoutResponse)
  async signOut(request: Request, response: Response): Promise<results.JsonResult | void> {
    const result = await this.authController.signOut({
      readOnlyAccess: response.locals.readOnlyAccess,
      authorizationHeader: <string>request.headers.authorization,
    })

    return this.json(result.data, result.status)
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
