import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { DeleteAccount } from '../../Domain/UseCase/DeleteAccount/DeleteAccount'
import { GetUserKeyParams } from '../../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { UpdateUser } from '../../Domain/UseCase/UpdateUser'
import { GetUserSubscription } from '../../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { ClearLoginAttempts } from '../../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../../Domain/UseCase/IncreaseLoginAttempts'
import { ChangeCredentials } from '../../Domain/UseCase/ChangeCredentials/ChangeCredentials'
import { HomeServerUsersController } from './HomeServer/HomeServerUsersController'

@controller('/users')
export class InversifyExpressUsersController extends HomeServerUsersController {
  constructor(
    @inject(TYPES.Auth_UpdateUser) override updateUser: UpdateUser,
    @inject(TYPES.Auth_GetUserKeyParams) override getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.Auth_DeleteAccount) override doDeleteAccount: DeleteAccount,
    @inject(TYPES.Auth_GetUserSubscription) override doGetUserSubscription: GetUserSubscription,
    @inject(TYPES.Auth_ClearLoginAttempts) override clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Auth_IncreaseLoginAttempts) override increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Auth_ChangeCredentials) override changeCredentialsUseCase: ChangeCredentials,
  ) {
    super(
      updateUser,
      getUserKeyParams,
      doDeleteAccount,
      doGetUserSubscription,
      clearLoginAttempts,
      increaseLoginAttempts,
      changeCredentialsUseCase,
    )
  }

  @httpPatch('/:userId', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async update(request: Request, response: Response): Promise<results.JsonResult> {
    return super.update(request, response)
  }

  @httpGet('/params')
  override async keyParams(request: Request): Promise<results.JsonResult> {
    return super.keyParams(request)
  }

  @httpDelete('/:email')
  override async deleteAccount(request: Request): Promise<results.JsonResult> {
    return super.deleteAccount(request)
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
