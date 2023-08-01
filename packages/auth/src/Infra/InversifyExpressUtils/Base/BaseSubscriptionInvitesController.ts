import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { ApiVersion } from '@standardnotes/api'

import { SubscriptionInvitesController } from '../../../Controller/SubscriptionInvitesController'
import { Role } from '../../../Domain/Role/Role'

export class BaseSubscriptionInvitesController extends BaseHttpController {
  constructor(
    protected subscriptionInvitesController: SubscriptionInvitesController,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.subscriptionInvites.accept', this.acceptInvite.bind(this))
      this.controllerContainer.register('auth.subscriptionInvites.declineInvite', this.declineInvite.bind(this))
      this.controllerContainer.register('auth.subscriptionInvites.create', this.inviteToSubscriptionSharing.bind(this))
      this.controllerContainer.register('auth.subscriptionInvites.delete', this.cancelSubscriptionSharing.bind(this))
      this.controllerContainer.register('auth.subscriptionInvites.list', this.listInvites.bind(this))
    }
  }

  async acceptInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.acceptInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    response.setHeader('x-invalidate-cache', response.locals.user.uuid)

    return this.json(result.data, result.status)
  }

  async declineInvite(request: Request): Promise<results.JsonResult> {
    const response = await this.subscriptionInvitesController.declineInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    return this.json(response.data, response.status)
  }

  async inviteToSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.invite({
      ...request.body,
      inviterEmail: response.locals.user.email,
      inviterUuid: response.locals.user.uuid,
      inviterRoles: response.locals.roles.map((role: Role) => role.name),
    })

    return this.json(result.data, result.status)
  }

  async cancelSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.cancelInvite({
      ...request.body,
      inviteUuid: request.params.inviteUuid,
      inviterEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }

  async listInvites(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.listInvites({
      ...request.body,
      inviterEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
