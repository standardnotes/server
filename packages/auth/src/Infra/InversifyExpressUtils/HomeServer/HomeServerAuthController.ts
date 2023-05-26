import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { Logger } from 'winston'

import { ClearLoginAttempts } from '../../../Domain/UseCase/ClearLoginAttempts'
import { GetUserKeyParams } from '../../../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { IncreaseLoginAttempts } from '../../../Domain/UseCase/IncreaseLoginAttempts'
import { SignIn } from '../../../Domain/UseCase/SignIn'
import { VerifyMFA } from '../../../Domain/UseCase/VerifyMFA'
import { AuthController } from '../../../Controller/AuthController'
import { BaseHttpController, results } from 'inversify-express-utils'

export class HomeServerAuthController extends BaseHttpController {
  constructor(
    protected verifyMFA: VerifyMFA,
    protected signInUseCase: SignIn,
    protected getUserKeyParams: GetUserKeyParams,
    protected clearLoginAttempts: ClearLoginAttempts,
    protected increaseLoginAttempts: IncreaseLoginAttempts,
    protected logger: Logger,
    protected authController: AuthController,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.params', this.params.bind(this))
      this.controllerContainer.register('auth.signIn', this.signIn.bind(this))
      this.controllerContainer.register('auth.pkceParams', this.pkceParams.bind(this))
      this.controllerContainer.register('auth.pkceSignIn', this.pkceSignIn.bind(this))
      this.controllerContainer.register('auth.users.register', this.register.bind(this))
      this.controllerContainer.register('auth.generateRecoveryCodes', this.generateRecoveryCodes.bind(this))
      this.controllerContainer.register('auth.signInWithRecoveryCodes', this.recoveryLogin.bind(this))
      this.controllerContainer.register('auth.recoveryKeyParams', this.recoveryParams.bind(this))
      this.controllerContainer.register('auth.signOut', this.signOut.bind(this))
    }
  }

  async params(request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.session) {
      const result = await this.getUserKeyParams.execute({
        email: response.locals.user.email,
        authenticated: true,
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

  async generateRecoveryCodes(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.authController.generateRecoveryCodes({
      userUuid: response.locals.user.uuid,
    })

    return this.json(result.data, result.status)
  }

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
    const result = await this.authController.signOut({
      readOnlyAccess: response.locals.readOnlyAccess,
      authorizationHeader: <string>request.headers.authorization,
    })

    return this.json(result.data, result.status)
  }

  async register(request: Request): Promise<results.JsonResult> {
    const response = await this.authController.register({
      ...request.body,
      userAgent: <string>request.headers['user-agent'],
    })

    return this.json(response.data, response.status)
  }
}
