import { ControllerContainerInterface } from '@standardnotes/domain-core'

import { CreateValetToken } from '../../Domain/UseCase/CreateValetToken/CreateValetToken'
import { InversifyExpressValetTokenController } from '../InversifyExpressUtils/InversifyExpressValetTokenController'

export class HomeServerValetTokenController extends InversifyExpressValetTokenController {
  constructor(override createValetKey: CreateValetToken, private controllerContainer: ControllerContainerInterface) {
    super(createValetKey)

    this.controllerContainer.register('auth.valet-tokens.create', this.create.bind(this))
  }
}
