import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { User } from '@standardnotes/responses'
import { Role, TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { SettingServiceInterface } from '../../Domain/Setting/SettingServiceInterface'
import { AuthenticateSubscriptionToken } from '../../Domain/UseCase/AuthenticateSubscriptionToken/AuthenticateSubscriptionToken'
import { CreateSubscriptionToken } from '../../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { InversifyExpressSubscriptionTokensController } from '../InversifyExpressUtils/InversifyExpressSubscriptionTokensController'

export class HomeServerSubscriptionTokensController extends InversifyExpressSubscriptionTokensController {
  constructor(
    override createSubscriptionToken: CreateSubscriptionToken,
    override authenticateToken: AuthenticateSubscriptionToken,
    override settingService: SettingServiceInterface,
    override userProjector: ProjectorInterface<User>,
    override roleProjector: ProjectorInterface<Role>,
    override tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>,
    override jwtTTL: number,
    private controllerContainer: ControllerContainerInterface,
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

    this.controllerContainer.register('auth.subscription-tokens.create', this.createToken.bind(this))
  }
}
