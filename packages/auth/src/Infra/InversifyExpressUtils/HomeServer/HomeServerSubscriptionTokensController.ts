import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { ErrorTag } from '@standardnotes/responses'
import { Role, TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { BaseHttpController, results } from 'inversify-express-utils'
import { Request, Response } from 'express'

import { SettingServiceInterface } from '../../../Domain/Setting/SettingServiceInterface'
import { AuthenticateSubscriptionToken } from '../../../Domain/UseCase/AuthenticateSubscriptionToken/AuthenticateSubscriptionToken'
import { CreateSubscriptionToken } from '../../../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SettingName } from '@standardnotes/settings'
import { User } from '../../../Domain/User/User'

export class HomeServerSubscriptionTokensController extends BaseHttpController {
  constructor(
    protected createSubscriptionToken: CreateSubscriptionToken,
    protected authenticateToken: AuthenticateSubscriptionToken,
    protected settingService: SettingServiceInterface,
    protected userProjector: ProjectorInterface<User>,
    protected roleProjector: ProjectorInterface<Role>,
    protected tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    protected jwtTTL: number,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.subscription-tokens.create', this.createToken.bind(this))
    }
  }

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
      settingName: SettingName.create(SettingName.NAMES.ExtensionKey).getValue(),
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
