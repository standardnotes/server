import { Request, Response } from 'express'
import {
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
import { AuthController } from '../../Controller/AuthController'
import { inject } from 'inversify'
import { BaseAuthController } from './Base/BaseAuthController'

@controller('/auth')
export class AnnotatedAuthController extends BaseAuthController {
  constructor(
    @inject(TYPES.Auth_VerifyMFA) override verifyMFA: VerifyMFA,
    @inject(TYPES.Auth_SignIn) override signInUseCase: SignIn,
    @inject(TYPES.Auth_GetUserKeyParams) override getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.Auth_ClearLoginAttempts) override clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Auth_IncreaseLoginAttempts) override increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Auth_Logger) override logger: Logger,
    @inject(TYPES.Auth_AuthController) override authController: AuthController,
  ) {
    super(verifyMFA, signInUseCase, getUserKeyParams, clearLoginAttempts, increaseLoginAttempts, logger, authController)
  }

  @httpGet('/params', TYPES.Auth_OptionalCrossServiceTokenMiddleware)
  override async params(request: Request, response: Response): Promise<results.JsonResult> {
    return super.params(request, response)
  }

  @httpPost('/sign_in', TYPES.Auth_LockMiddleware)
  override async signIn(request: Request): Promise<results.JsonResult> {
    return super.signIn(request)
  }

  @httpPost('/pkce_params', TYPES.Auth_OptionalCrossServiceTokenMiddleware)
  override async pkceParams(request: Request, response: Response): Promise<results.JsonResult> {
    return super.pkceParams(request, response)
  }

  @httpPost('/pkce_sign_in', TYPES.Auth_LockMiddleware)
  override async pkceSignIn(request: Request): Promise<results.JsonResult> {
    return super.pkceSignIn(request)
  }

  @httpPost('/recovery/codes', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async generateRecoveryCodes(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.generateRecoveryCodes(_request, response)
  }

  @httpPost('/recovery/login', TYPES.Auth_LockMiddleware)
  override async recoveryLogin(request: Request): Promise<results.JsonResult> {
    return super.recoveryLogin(request)
  }

  @httpPost('/recovery/params')
  override async recoveryParams(request: Request): Promise<results.JsonResult> {
    return super.recoveryParams(request)
  }

  @httpPost('/sign_out', TYPES.Auth_OptionalCrossServiceTokenMiddleware)
  override async signOut(request: Request, response: Response): Promise<results.JsonResult | void> {
    return super.signOut(request, response)
  }

  @httpPost('/')
  override async register(request: Request): Promise<results.JsonResult> {
    return super.register(request)
  }
}
