import { Request, Response } from 'express'
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import { inject } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { SubscriptionInvitesController } from '../../Controller/SubscriptionInvitesController'
import { BaseSubscriptionInvitesController } from './Base/BaseSubscriptionInvitesController'

@controller('/subscription-invites')
export class InversifyExpressSubscriptionInvitesController extends BaseSubscriptionInvitesController {
  constructor(
    @inject(TYPES.Auth_SubscriptionInvitesController)
    override subscriptionInvitesController: SubscriptionInvitesController,
  ) {
    super(subscriptionInvitesController)
  }

  @httpPost('/:inviteUuid/accept', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async acceptInvite(request: Request, response: Response): Promise<results.JsonResult> {
    return super.acceptInvite(request, response)
  }

  @httpGet('/:inviteUuid/decline')
  override async declineInvite(request: Request): Promise<results.JsonResult> {
    return super.declineInvite(request)
  }

  @httpPost('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async inviteToSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    return super.inviteToSubscriptionSharing(request, response)
  }

  @httpDelete('/:inviteUuid', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async cancelSubscriptionSharing(request: Request, response: Response): Promise<results.JsonResult> {
    return super.cancelSubscriptionSharing(request, response)
  }

  @httpGet('/', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
  override async listInvites(request: Request, response: Response): Promise<results.JsonResult> {
    return super.listInvites(request, response)
  }
}
