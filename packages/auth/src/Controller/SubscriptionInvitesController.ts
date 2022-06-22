import { Role } from '@standardnotes/auth'
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

import TYPES from '../Bootstrap/Types'
import { AcceptSharedSubscriptionInvitation } from '../Domain/UseCase/AcceptSharedSubscriptionInvitation/AcceptSharedSubscriptionInvitation'
import { CancelSharedSubscriptionInvitation } from '../Domain/UseCase/CancelSharedSubscriptionInvitation/CancelSharedSubscriptionInvitation'
import { DeclineSharedSubscriptionInvitation } from '../Domain/UseCase/DeclineSharedSubscriptionInvitation/DeclineSharedSubscriptionInvitation'
import { InviteToSharedSubscription } from '../Domain/UseCase/InviteToSharedSubscription/InviteToSharedSubscription'
import { ListSharedSubscriptionInvitations } from '../Domain/UseCase/ListSharedSubscriptionInvitations/ListSharedSubscriptionInvitations'

@controller('/subscription-invites')
export class SubscriptionInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.InviteToSharedSubscription) private inviteToSharedSubscription: InviteToSharedSubscription,
    @inject(TYPES.AcceptSharedSubscriptionInvitation)
    private acceptSharedSubscriptionInvitation: AcceptSharedSubscriptionInvitation,
    @inject(TYPES.DeclineSharedSubscriptionInvitation)
    private declineSharedSubscriptionInvitation: DeclineSharedSubscriptionInvitation,
    @inject(TYPES.CancelSharedSubscriptionInvitation)
    private cancelSharedSubscriptionInvitation: CancelSharedSubscriptionInvitation,
    @inject(TYPES.ListSharedSubscriptionInvitations)
    private listSharedSubscriptionInvitations: ListSharedSubscriptionInvitations,
  ) {
    super()
  }

  @httpGet('/:inviteUuid/accept')
  async acceptInvite(request: Request): Promise<results.JsonResult> {
    const result = await this.acceptSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: request.params.inviteUuid,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpGet('/:inviteUuid/decline')
  async declineInvite(request: Request): Promise<results.JsonResult> {
    const result = await this.declineSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: request.params.inviteUuid,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpPost('/', TYPES.ApiGatewayAuthMiddleware)
  async inviteToSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    if (!request.body.identifier) {
      return this.json({ error: { message: 'Missing invitee identifier' } }, 400)
    }
    const result = await this.inviteToSharedSubscription.execute({
      inviterEmail: response.locals.user.email,
      inviterUuid: response.locals.user.uuid,
      inviteeIdentifier: request.body.identifier,
      inviterRoles: response.locals.roles.map((role: Role) => role.name),
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpDelete('/:inviteUuid', TYPES.ApiGatewayAuthMiddleware)
  async cancelSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.cancelSharedSubscriptionInvitation.execute({
      sharedSubscriptionInvitationUuid: request.params.inviteUuid,
      inviterEmail: response.locals.user.email,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpGet('/', TYPES.ApiGatewayAuthMiddleware)
  async listInvites(_request: Request, response: Response): Promise<results.JsonResult> {
    const result = await this.listSharedSubscriptionInvitations.execute({
      inviterEmail: response.locals.user.email,
    })

    return this.json(result)
  }
}
