import { ControllerContainerInterface } from '@standardnotes/domain-core'

import { UserRequestsController } from '../../Controller/UserRequestsController'
import { InversifyExpressUserRequestsController } from '../InversifyExpressUtils/InversifyExpressUserRequestsController'

export class HomeServerUserRequestsController extends InversifyExpressUserRequestsController {
  constructor(
    override userRequestsController: UserRequestsController,
    private controllerContainer: ControllerContainerInterface,
  ) {
    super(userRequestsController)

    this.controllerContainer.register('auth.users.createRequest', this.submitRequest.bind(this))
  }
}
