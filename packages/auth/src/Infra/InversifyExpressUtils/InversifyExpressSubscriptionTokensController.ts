import { CrossServiceTokenData, TokenEncoderInterface } from '@standardnotes/security'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  controller,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { Role } from '../../Domain/Role/Role'
import { SettingServiceInterface } from '../../Domain/Setting/SettingServiceInterface'
import { AuthenticateSubscriptionToken } from '../../Domain/UseCase/AuthenticateSubscriptionToken/AuthenticateSubscriptionToken'
import { CreateSubscriptionToken } from '../../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { User } from '../../Domain/User/User'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { HomeServerSubscriptionTokensController } from './HomeServer/HomeServerSubscriptionTokensController'

@controller('/subscription-tokens')
export class InversifyExpressSubscriptionTokensController extends HomeServerSubscriptionTokensController {
  constructor(
    @inject(TYPES.Auth_CreateSubscriptionToken) override createSubscriptionToken: CreateSubscriptionToken,
    @inject(TYPES.Auth_AuthenticateSubscriptionToken) override authenticateToken: AuthenticateSubscriptionToken,
    @inject(TYPES.Auth_SettingService) override settingService: SettingServiceInterface,
    @inject(TYPES.Auth_UserProjector) override userProjector: ProjectorInterface<User>,
    @inject(TYPES.Auth_RoleProjector) override roleProjector: ProjectorInterface<Role>,
    @inject(TYPES.Auth_CrossServiceTokenEncoder) override tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    @inject(TYPES.Auth_AUTH_JWT_TTL) override jwtTTL: number,
  ) {
    super(
      createSubscriptionToken,
      authenticateToken,
      settingService,
      userProjector,
      roleProjector,
      tokenEncoder,
      jwtTTL,
    )
  }

  @httpPost('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async createToken(_request: Request, response: Response): Promise<results.JsonResult> {
    return super.createToken(_request, response)
  }

  @httpPost('/:token/validate')
  override async validate(request: Request): Promise<results.JsonResult> {
    return super.validate(request)
  }
}
