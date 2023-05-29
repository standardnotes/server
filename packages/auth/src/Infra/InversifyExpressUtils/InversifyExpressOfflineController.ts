import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import { Logger } from 'winston'
import { OfflineUserTokenData, TokenEncoderInterface } from '@standardnotes/security'
import TYPES from '../../Bootstrap/Types'
import { AuthenticateOfflineSubscriptionToken } from '../../Domain/UseCase/AuthenticateOfflineSubscriptionToken/AuthenticateOfflineSubscriptionToken'
import { CreateOfflineSubscriptionToken } from '../../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { GetUserFeatures } from '../../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { GetUserOfflineSubscription } from '../../Domain/UseCase/GetUserOfflineSubscription/GetUserOfflineSubscription'
import { HomeServerOfflineController } from './HomeServer/HomeServerOfflineController'

@controller('/offline')
export class InversifyExpressOfflineController extends HomeServerOfflineController {
  constructor(
    @inject(TYPES.Auth_GetUserFeatures) override doGetUserFeatures: GetUserFeatures,
    @inject(TYPES.Auth_GetUserOfflineSubscription) override getUserOfflineSubscription: GetUserOfflineSubscription,
    @inject(TYPES.Auth_CreateOfflineSubscriptionToken)
    override createOfflineSubscriptionToken: CreateOfflineSubscriptionToken,
    @inject(TYPES.Auth_AuthenticateOfflineSubscriptionToken)
    override authenticateToken: AuthenticateOfflineSubscriptionToken,
    @inject(TYPES.Auth_OfflineUserTokenEncoder) override tokenEncoder: TokenEncoderInterface<OfflineUserTokenData>,
    @inject(TYPES.Auth_AUTH_JWT_TTL) override jwtTTL: number,
    @inject(TYPES.Auth_Logger) override logger: Logger,
  ) {
    super(
      doGetUserFeatures,
      getUserOfflineSubscription,
      createOfflineSubscriptionToken,
      authenticateToken,
      tokenEncoder,
      jwtTTL,
      logger,
    )
  }

  @httpGet('/features', TYPES.Auth_OfflineUserAuthMiddleware)
  override async getOfflineFeatures(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.getOfflineFeatures(_request, response)
  }

  @httpPost('/subscription-tokens')
  override async createToken(request: Request): Promise<results.JsonResult> {
    return super.createToken(request)
  }

  @httpPost('/subscription-tokens/:token/validate')
  override async validate(request: Request): Promise<results.JsonResult> {
    return super.validate(request)
  }

  @httpGet('/users/subscription', TYPES.Auth_ApiGatewayOfflineAuthMiddleware)
  override async getSubscription(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.getSubscription(_request, response)
  }
}
