import { Request, Response } from 'express'
import {
  controller,
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
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { DomainEventFactoryInterface } from '../../Domain/Event/DomainEventFactoryInterface'
import { Register } from '../../Domain/UseCase/Register'
import { SessionServiceInterface } from '../../Domain/Session/SessionServiceInterface'
import { VerifyHumanInteraction } from '../../Domain/UseCase/VerifyHumanInteraction/VerifyHumanInteraction'
import { CookieFactoryInterface } from '../../Domain/Auth/Cookies/CookieFactoryInterface'
import { SignInWithRecoveryCodes } from '../../Domain/UseCase/SignInWithRecoveryCodes/SignInWithRecoveryCodes'
import { DeleteSessionByToken } from '../../Domain/UseCase/DeleteSessionByToken/DeleteSessionByToken'

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
    @inject(TYPES.Auth_Register) override registerUser: Register,
    @inject(TYPES.Auth_DomainEventPublisher) override domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Auth_DomainEventFactory) override domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Auth_SessionService) override sessionService: SessionServiceInterface,
    @inject(TYPES.Auth_VerifyHumanInteraction) override humanVerificationUseCase: VerifyHumanInteraction,
    @inject(TYPES.Auth_CookieFactory) override cookieFactory: CookieFactoryInterface,
    @inject(TYPES.Auth_SignInWithRecoveryCodes) override signInWithRecoveryCodes: SignInWithRecoveryCodes,
    @inject(TYPES.Auth_DeleteSessionByToken) override deleteSessionByToken: DeleteSessionByToken,
    @inject(TYPES.Auth_CAPTCHA_UI_URL) override captchaUIUrl: string,
  ) {
    super(
      verifyMFA,
      signInUseCase,
      getUserKeyParams,
      clearLoginAttempts,
      increaseLoginAttempts,
      logger,
      authController,
      registerUser,
      domainEventPublisher,
      domainEventFactory,
      sessionService,
      humanVerificationUseCase,
      cookieFactory,
      signInWithRecoveryCodes,
      deleteSessionByToken,
      captchaUIUrl,
    )
  }

  @httpPost('/pkce_params', TYPES.Auth_OptionalCrossServiceTokenMiddleware)
  override async pkceParams(request: Request, response: Response): Promise<results.JsonResult> {
    return super.pkceParams(request, response)
  }

  @httpPost('/pkce_sign_in', TYPES.Auth_LockMiddleware)
  override async pkceSignIn(request: Request, response: Response): Promise<results.JsonResult> {
    return super.pkceSignIn(request, response)
  }

  @httpPost('/recovery/codes', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async generateRecoveryCodes(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.generateRecoveryCodes(_request, response)
  }

  @httpPost('/recovery/login', TYPES.Auth_LockMiddleware)
  override async recoveryLogin(request: Request, response: Response): Promise<results.JsonResult> {
    return super.recoveryLogin(request, response)
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
  override async register(request: Request, response: Response): Promise<results.JsonResult> {
    return super.register(request, response)
  }
}
