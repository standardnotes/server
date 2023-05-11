import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { GetUserFeatures } from '../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { AuthenticateOfflineSubscriptionToken } from '../Domain/UseCase/AuthenticateOfflineSubscriptionToken/AuthenticateOfflineSubscriptionToken'
import { CreateOfflineSubscriptionToken } from '../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { GetUserOfflineSubscription } from '../Domain/UseCase/GetUserOfflineSubscription/GetUserOfflineSubscription'
import { Logger } from 'winston'
import { OfflineUserTokenData, TokenEncoderInterface } from '@standardnotes/security'

@controller('/offline')
export class OfflineController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetUserFeatures) private doGetUserFeatures: GetUserFeatures,
    @inject(TYPES.Auth_GetUserOfflineSubscription) private getUserOfflineSubscription: GetUserOfflineSubscription,
    @inject(TYPES.Auth_CreateOfflineSubscriptionToken)
    private createOfflineSubscriptionToken: CreateOfflineSubscriptionToken,
    @inject(TYPES.Auth_AuthenticateOfflineSubscriptionToken) private authenticateToken: AuthenticateOfflineSubscriptionToken,
    @inject(TYPES.Auth_OfflineUserTokenEncoder) private tokenEncoder: TokenEncoderInterface<OfflineUserTokenData>,
    @inject(TYPES.Auth_AUTH_JWT_TTL) private jwtTTL: number,
    @inject(TYPES.Auth_Logger) private logger: Logger,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: any,
  ) {
    super()

    this.controllerContainer.register('OfflineController', this)
  }

  @httpGet('/features', TYPES.Auth_OfflineUserAuthMiddleware)
  async getOfflineFeatures(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.doGetUserFeatures.execute({
      email: response.locals.offlineUserEmail,
      offline: true,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpPost('/subscription-tokens')
  async createToken(request: Request): Promise<results.JsonResult> {
    if (!request.body.email) {
      return this.json(
        {
          error: {
            tag: 'invalid-request',
            message: 'Invalid request parameters.',
          },
        },
        400,
      )
    }

    const response = await this.createOfflineSubscriptionToken.execute({
      userEmail: request.body.email,
    })

    if (!response.success) {
      return this.json({ success: false, error: { tag: response.error } })
    }

    return this.json({ success: true })
  }

  @httpPost('/subscription-tokens/:token/validate')
  async validate(request: Request): Promise<results.JsonResult> {
    if (!request.body.email) {
      this.logger.debug('[Offline Subscription Token Validation] Missing email')

      return this.json(
        {
          error: {
            tag: 'invalid-request',
            message: 'Invalid request parameters.',
          },
        },
        400,
      )
    }

    const authenticateTokenResponse = await this.authenticateToken.execute({
      token: request.params.token,
      userEmail: request.body.email,
    })

    if (!authenticateTokenResponse.success) {
      this.logger.debug('[Offline Subscription Token Validation] invalid token')

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

    const offlineAuthTokenData: OfflineUserTokenData = {
      userEmail: authenticateTokenResponse.email,
      featuresToken: authenticateTokenResponse.featuresToken,
    }

    const authToken = this.tokenEncoder.encodeExpirableToken(offlineAuthTokenData, this.jwtTTL)

    this.logger.debug(
      `[Offline Subscription Token Validation] authenticated token for user ${authenticateTokenResponse.email}`,
    )

    return this.json({ authToken })
  }

  @httpGet('/users/subscription', TYPES.Auth_ApiGatewayOfflineAuthMiddleware)
  async getSubscription(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.getUserOfflineSubscription.execute({
      userEmail: response.locals.userEmail,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }
}
