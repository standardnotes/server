import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { TokenEncoderInterface, OfflineUserTokenData } from '@standardnotes/security'
import { Logger } from 'winston'
import { BaseHttpController, results } from 'inversify-express-utils'

import { AuthenticateOfflineSubscriptionToken } from '../../../Domain/UseCase/AuthenticateOfflineSubscriptionToken/AuthenticateOfflineSubscriptionToken'
import { CreateOfflineSubscriptionToken } from '../../../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { GetUserFeatures } from '../../../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { GetUserOfflineSubscription } from '../../../Domain/UseCase/GetUserOfflineSubscription/GetUserOfflineSubscription'

export class HomeServerOfflineController extends BaseHttpController {
  constructor(
    protected doGetUserFeatures: GetUserFeatures,
    protected getUserOfflineSubscription: GetUserOfflineSubscription,
    protected createOfflineSubscriptionToken: CreateOfflineSubscriptionToken,
    protected authenticateToken: AuthenticateOfflineSubscriptionToken,
    protected tokenEncoder: TokenEncoderInterface<OfflineUserTokenData>,
    protected jwtTTL: number,
    protected logger: Logger,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.offline.features', this.getOfflineFeatures.bind(this))
      this.controllerContainer.register('auth.offline.subscriptionTokens.create', this.createToken.bind(this))
      this.controllerContainer.register('auth.users.getOfflineSubscriptionByToken', this.getSubscription.bind(this))
    }
  }

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
