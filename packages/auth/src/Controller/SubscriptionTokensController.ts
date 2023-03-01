import { CrossServiceTokenData, TokenEncoderInterface } from '@standardnotes/security'
import { ErrorTag } from '@standardnotes/responses'
import { SettingName } from '@standardnotes/settings'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'

import TYPES from '../Bootstrap/Types'
import { Role } from '../Domain/Role/Role'
import { SettingServiceInterface } from '../Domain/Setting/SettingServiceInterface'
import { AuthenticateSubscriptionToken } from '../Domain/UseCase/AuthenticateSubscriptionToken/AuthenticateSubscriptionToken'
import { CreateSubscriptionToken } from '../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { User } from '../Domain/User/User'
import { ProjectorInterface } from '../Projection/ProjectorInterface'

@controller('/subscription-tokens')
export class SubscriptionTokensController extends BaseHttpController {
  constructor(
    @inject(TYPES.CreateSubscriptionToken) private createSubscriptionToken: CreateSubscriptionToken,
    @inject(TYPES.AuthenticateSubscriptionToken) private authenticateToken: AuthenticateSubscriptionToken,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.UserProjector) private userProjector: ProjectorInterface<User>,
    @inject(TYPES.RoleProjector) private roleProjector: ProjectorInterface<Role>,
    @inject(TYPES.CrossServiceTokenEncoder) private tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    @inject(TYPES.AUTH_JWT_TTL) private jwtTTL: number,
  ) {
    super()
  }

  @httpPost('/', TYPES.ApiGatewayAuthMiddleware)
  async createToken(_request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

    const result = await this.createSubscriptionToken.execute({
      userUuid: response.locals.user.uuid,
    })

    return this.json({
      token: result.subscriptionToken.token,
    })
  }

  @httpPost('/:token/validate')
  async validate(request: Request): Promise<results.JsonResult> {
    const authenticateTokenResponse = await this.authenticateToken.execute({
      token: request.params.token,
    })

    if (!authenticateTokenResponse.success) {
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

    const user = authenticateTokenResponse.user as User
    let extensionKey = undefined
    const extensionKeySetting = await this.settingService.findSettingWithDecryptedValue({
      settingName: SettingName.ExtensionKey,
      userUuid: user.uuid,
    })
    if (extensionKeySetting !== null) {
      extensionKey = extensionKeySetting.value as string
    }

    const roles = await user.roles

    const authTokenData: CrossServiceTokenData = {
      user: await this.projectUser(user),
      roles: await this.projectRoles(roles),
      extensionKey,
    }

    const authToken = this.tokenEncoder.encodeExpirableToken(authTokenData, this.jwtTTL)

    return this.json({ authToken })
  }

  private async projectUser(user: User): Promise<{ uuid: string; email: string }> {
    return <{ uuid: string; email: string }>await this.userProjector.projectSimple(user)
  }

  private async projectRoles(roles: Array<Role>): Promise<Array<{ uuid: string; name: string }>> {
    const roleProjections = []
    for (const role of roles) {
      roleProjections.push(<{ uuid: string; name: string }>await this.roleProjector.projectSimple(role))
    }

    return roleProjections
  }
}
