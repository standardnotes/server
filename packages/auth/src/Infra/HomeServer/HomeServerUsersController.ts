import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { ChangeCredentials } from '../../Domain/UseCase/ChangeCredentials/ChangeCredentials'
import { ClearLoginAttempts } from '../../Domain/UseCase/ClearLoginAttempts'
import { DeleteAccount } from '../../Domain/UseCase/DeleteAccount/DeleteAccount'
import { GetUserKeyParams } from '../../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { GetUserSubscription } from '../../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { IncreaseLoginAttempts } from '../../Domain/UseCase/IncreaseLoginAttempts'
import { UpdateUser } from '../../Domain/UseCase/UpdateUser'
import { InversifyExpressUsersController } from '../InversifyExpressUtils/InversifyExpressUsersController'

export class HomeServerUsersController extends InversifyExpressUsersController {
  constructor(
    override updateUser: UpdateUser,
    override getUserKeyParams: GetUserKeyParams,
    override doDeleteAccount: DeleteAccount,
    override doGetUserSubscription: GetUserSubscription,
    override clearLoginAttempts: ClearLoginAttempts,
    override increaseLoginAttempts: IncreaseLoginAttempts,
    override changeCredentialsUseCase: ChangeCredentials,
    private controllerContainer: ControllerContainerInterface,
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

    this.controllerContainer.register('auth.users.update', this.update.bind(this))
    this.controllerContainer.register('auth.users.getKeyParams', this.keyParams.bind(this))
    this.controllerContainer.register('auth.users.getSubscription', this.getSubscription.bind(this))
    this.controllerContainer.register('auth.users.updateCredentials', this.changeCredentials.bind(this))
  }
}
