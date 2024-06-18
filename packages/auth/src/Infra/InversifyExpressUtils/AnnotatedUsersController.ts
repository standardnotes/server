import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { DeleteAccount } from '../../Domain/UseCase/DeleteAccount/DeleteAccount'
import { GetUserSubscription } from '../../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { ClearLoginAttempts } from '../../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../../Domain/UseCase/IncreaseLoginAttempts'
import { ChangeCredentials } from '../../Domain/UseCase/ChangeCredentials/ChangeCredentials'
import { BaseUsersController } from './Base/BaseUsersController'
import { CookieFactoryInterface } from '../../Domain/Auth/Cookies/CookieFactoryInterface'

@controller('/users')
export class AnnotatedUsersController extends BaseUsersController {
  constructor(
    @inject(TYPES.Auth_DeleteAccount) override doDeleteAccount: DeleteAccount,
    @inject(TYPES.Auth_GetUserSubscription) override doGetUserSubscription: GetUserSubscription,
    @inject(TYPES.Auth_ClearLoginAttempts) override clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Auth_IncreaseLoginAttempts) override increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Auth_ChangeCredentials) override changeCredentialsUseCase: ChangeCredentials,
    @inject(TYPES.Auth_CookieFactory) override cookieFactory: CookieFactoryInterface,
  ) {
    super(
      doDeleteAccount,
      doGetUserSubscription,
      clearLoginAttempts,
      increaseLoginAttempts,
      changeCredentialsUseCase,
      cookieFactory,
    )
  }

  @httpDelete('/:userUuid', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async deleteAccount(request: Request, response: Response): Promise<results.JsonResult> {
    return super.deleteAccount(request, response)
  }

  @httpGet('/:userUuid/subscription', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async getSubscription(request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSubscription(request, response)
  }

  @httpPut('/:userId/attributes/credentials', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async changeCredentials(request: Request, response: Response): Promise<results.JsonResult> {
    return super.changeCredentials(request, response)
  }
}
