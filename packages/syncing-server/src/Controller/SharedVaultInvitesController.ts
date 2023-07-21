import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  results,
  httpDelete,
  httpGet,
  httpPatch,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { SharedVaultInviteServiceInterface } from '../Domain/SharedVaultInvite/Service/SharedVaultInviteServiceInterface'
import { SharedVaultInviteProjector } from '../Projection/SharedVaultInviteProjector'

@controller('/shared-vaults')
export class SharedVaultInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.SharedVaultInviteService) private sharedVaultInviteService: SharedVaultInviteServiceInterface,
    @inject(TYPES.SharedVaultInviteProjector) private sharedVaultInviteProjector: SharedVaultInviteProjector,
  ) {
    super()
  }

  @httpPost('/:sharedVaultUuid/invites', TYPES.AuthMiddleware)
  public async createSharedVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.createInvite({
      senderUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
      recipientUuid: request.body.recipient_uuid,
      encryptedMessage: request.body.encrypted_message,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create invite')
    }

    return this.json({ invite: this.sharedVaultInviteProjector.projectFull(result) })
  }

  @httpPatch('/:sharedVaultUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async updateSharedVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.updateInvite({
      senderUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
      encryptedMessage: request.body.encrypted_message,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not update invite')
    }

    return this.json({ invite: this.sharedVaultInviteProjector.projectFull(result) })
  }

  @httpPost('/:sharedVaultUuid/invites/:inviteUuid/accept', TYPES.AuthMiddleware)
  public async acceptSharedVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.acceptInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not accept invite')
    }

    return this.json({ success: true })
  }

  @httpPost('/:sharedVaultUuid/invites/:inviteUuid/decline', TYPES.AuthMiddleware)
  public async declineSharedVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.declineInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not decline invite')
    }

    return this.json({ success: true })
  }

  @httpDelete('/invites/inbound', TYPES.AuthMiddleware)
  public async deleteInboundUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    await this.sharedVaultInviteService.deleteAllInboundInvites({
      userUuid: response.locals.user.uuid,
    })

    return this.json({ success: true })
  }

  @httpGet('/invites/outbound', TYPES.AuthMiddleware)
  public async getOutboundUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.getOutboundInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault invites')
    }

    const projected = result.map((invite) => this.sharedVaultInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpGet('/invites', TYPES.AuthMiddleware)
  public async getUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.getInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault invites')
    }

    const projected = result.map((invite) => this.sharedVaultInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpGet('/:sharedVaultUuid/invites', TYPES.AuthMiddleware)
  public async getSharedVaultInvites(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.getInvitesForSharedVault({
      originatorUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault invites')
    }

    const projected = result.map((invite) => this.sharedVaultInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpDelete('/:sharedVaultUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async deleteSharedVaultInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.deleteInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete invite')
    }

    return this.json({ success: true })
  }

  @httpDelete('/:sharedVaultUuid/invites', TYPES.AuthMiddleware)
  public async deleteAllSharedVaultInvites(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultInviteService.deleteAllInvitesForSharedVault({
      originatorUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete invite')
    }

    return this.json({ success: true })
  }

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }
}
