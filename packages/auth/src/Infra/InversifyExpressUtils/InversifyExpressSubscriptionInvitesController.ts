import { ApiVersion } from '@standardnotes/api'
import { Role } from '@standardnotes/security'
import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { SubscriptionInvitesController } from '../../Controller/SubscriptionInvitesController'
import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { inject } from 'inversify'

@controller('/subscription-invites')
export class InversifyExpressSubscriptionInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_SubscriptionInvitesController)
    private subscriptionInvitesController: SubscriptionInvitesController,
    @inject(TYPES.Auth_ControllerContainer) private controllerContainer: ControllerContainerInterface,
  ) {
    super()

    this.controllerContainer.register('auth.subscriptionInvites.accept', this.acceptInvite.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.declineInvite', this.declineInvite.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.create', this.inviteToSubscriptionSharing.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.delete', this.cancelSubscriptionSharing.bind(this))
    this.controllerContainer.register('auth.subscriptionInvites.list', this.listInvites.bind(this))
  }

  @httpPost('/:inviteUuid/accept', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async acceptInvite(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.acceptInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    response.setHeader('x-invalidate-cache', response.locals.user.uuid)

    return this.json(result.data, result.status)
  }

  @httpGet('/:inviteUuid/decline')
  async declineInvite(request: Request): Promise<results.JsonResult> {
    const response = await this.subscriptionInvitesController.declineInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    return this.json(response.data, response.status)
  }

  @httpPost('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async inviteToSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.invite({
      ...request.body,
      inviterEmail: response.locals.user.email,
      inviterUuid: response.locals.user.uuid,
      inviterRoles: response.locals.roles.map((role: Role) => role.name),
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/:inviteUuid', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async cancelSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.cancelInvite({
      ...request.body,
      inviteUuid: request.params.inviteUuid,
      inviterEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  async listInvites(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.listInvites({
      ...request.body,
      inviterEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
