import { ControllerContainerInterface } from '@standardnotes/domain-core'

import { SubscriptionInvitesController } from '../../Controller/SubscriptionInvitesController'
import { InversifyExpressSubscriptionInvitesController } from '../InversifyExpressUtils/InversifyExpressSubscriptionInvitesController'

export class HomeServerSubscriptionInvitesController extends InversifyExpressSubscriptionInvitesController {
  constructor(
    override subscriptionInvitesController: SubscriptionInvitesController,
    private controllerContainer: ControllerContainerInterface,
  ) {
    super(subscriptionInvitesController)

    this.controllerContainer.register('auth.subscriptionInvites.accept', this.acceptInvite.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.declineInvite', this.declineInvite.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.create', this.inviteToSubscriptionSharing.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.delete', this.cancelSubscriptionSharing.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.list', this.listInvites.bind(this))
  }
}
