import { Request } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HomeServerAdminController } from './HomeServer/HomeServerAdminController'
import { CreateOfflineSubscriptionToken } from '../../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { CreateSubscriptionToken } from '../../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { DeleteSetting } from '../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { UserRepositoryInterface } from '../../Domain/User/UserRepositoryInterface'

@controller('/admin')
export class InversifyExpressAdminController extends HomeServerAdminController {
  constructor(
    @inject(TYPES.Auth_DeleteSetting) override doDeleteSetting: DeleteSetting,
    @inject(TYPES.Auth_UserRepository) override userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_CreateSubscriptionToken) override createSubscriptionToken: CreateSubscriptionToken,
    @inject(TYPES.Auth_CreateOfflineSubscriptionToken)
    override createOfflineSubscriptionToken: CreateOfflineSubscriptionToken,
  ) {
    super(doDeleteSetting, userRepository, createSubscriptionToken, createOfflineSubscriptionToken)
  }

  @httpGet('/user/:email')
  override async getUser(request: Request): Promise<results.JsonResult> {
    return super.getUser(request)
  }

  @httpDelete('/users/:userUuid/mfa')
  override async deleteMFASetting(request: Request): Promise<results.JsonResult> {
    return super.deleteMFASetting(request)
  }

  @httpPost('/users/:userUuid/subscription-token')
  override async createToken(request: Request): Promise<results.JsonResult> {
    return super.createToken(request)
  }

  @httpPost('/users/:email/offline-subscription-token')
  override async createOfflineToken(request: Request): Promise<results.JsonResult | results.BadRequestResult> {
    return super.createOfflineToken(request)
  }

  @httpPost('/users/:userUuid/email-backups')
  override async disableEmailBackups(
    request: Request,
  ): Promise<results.BadRequestErrorMessageResult | results.OkResult> {
    return super.disableEmailBackups(request)
  }
}
