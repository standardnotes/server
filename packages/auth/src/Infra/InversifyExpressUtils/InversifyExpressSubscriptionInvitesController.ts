import { ApiVersion } from '@standardnotes/api'
import { Role } from '@standardnotes/security'
import { Request, Response } from 'express'
import { inject } from 'inversify'
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

@controller('/subscription-invites')
export class InversifyExpressSubscriptionInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.SubscriptionInvitesController) private subscriptionInvitesController: SubscriptionInvitesController,
  ) {
    super()
  }

  @httpGet('/:inviteUuid/accept')
  async acceptInvite(request: Request): Promise<results.JsonResult> {
    const response = await this.subscriptionInvitesController.acceptInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    return this.json(response.data, response.status)
  }

  @httpGet('/:inviteUuid/decline')
  async declineInvite(request: Request): Promise<results.JsonResult> {
    const response = await this.subscriptionInvitesController.declineInvite({
      api: request.query.api as ApiVersion,
      inviteUuid: request.params.inviteUuid,
    })

    return this.json(response.data, response.status)
  }

  @httpPost('/', TYPES.ApiGatewayAuthMiddleware)
  async inviteToSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.invite({
      ...request.body,
      inviterEmail: response.locals.user.email,
      inviterUuid: response.locals.user.uuid,
      inviterRoles: response.locals.roles.map((role: Role) => role.name),
    })

    return this.json(result.data, result.status)
  }

  @httpDelete('/:inviteUuid', TYPES.ApiGatewayAuthMiddleware)
  async cancelSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.cancelInvite({
      ...request.body,
      inviteUuid: request.params.inviteUuid,
      inviterEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }

  @httpGet('/', TYPES.ApiGatewayAuthMiddleware)
  async listInvites(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.subscriptionInvitesController.listInvites({
      ...request.body,
      inviterEmail: response.locals.user.email,
    })

    return this.json(result.data, result.status)
  }
}
