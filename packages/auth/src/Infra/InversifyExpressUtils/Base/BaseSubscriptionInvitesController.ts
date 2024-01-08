import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'
import { ApiVersion } from '@standardnotes/api'

import { SubscriptionInvitesController } from '../../../Controller/SubscriptionInvitesController'
import { ResponseLocals } from '../ResponseLocals'
import { Role } from '@standardnotes/security'

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
    const locals = response.locals as ResponseLocals

    const result = await this.subscriptionInvitesController.acceptInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    response.setHeader('x-invalidate-cache', locals.user.uuid)

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
    const locals = response.locals as ResponseLocals

    const result = await this.subscriptionInvitesController.invite({
      ...request.body,
      inviterEmail: locals.user.email,
      inviterUuid: locals.user.uuid,
      inviterRoles: locals.roles.map((role: Role) => role.name),
    })

    return this.json(result.data, result.status)
  }

  async cancelSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    const result = await this.subscriptionInvitesController.cancelInvite({
      ...request.body,
      inviteUuid: request.params.inviteUuid,
      inviterEmail: locals.user.email,
    })

    return this.json(result.data, result.status)
  }

  async listInvites(request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    const result = await this.subscriptionInvitesController.listInvites({
      ...request.body,
      inviterEmail: locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
