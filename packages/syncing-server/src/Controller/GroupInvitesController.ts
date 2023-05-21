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
import { GroupInviteServiceInterface } from '../Domain/GroupInvite/Service/GroupInviteServiceInterface'
import { GroupInviteProjector } from '../Projection/GroupInviteProjector'

@controller('/groups')
export class GroupInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupInviteService) private groupInviteService: GroupInviteServiceInterface,
    @inject(TYPES.GroupInviteProjector) private groupInviteProjector: GroupInviteProjector,
  ) {
    super()
  }

  @httpPost('/:groupUuid/invites', TYPES.AuthMiddleware)
  public async createGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.createInvite({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      userUuid: request.body.invitee_uuid,
      inviterPublicKey: request.body.inviter_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
      inviteType: request.body.invite_type,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not create invite')
    }

    return this.json({ invite: this.groupInviteProjector.projectFull(result) })
  }

  @httpPatch('/:groupUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async updateGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.updateInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
      inviterPublicKey: request.body.inviter_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not update invite')
    }

    return this.json({ invite: this.groupInviteProjector.projectFull(result) })
  }

  @httpPost('/:groupUuid/invites/:inviteUuid/accept', TYPES.AuthMiddleware)
  public async acceptGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.acceptInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not accept invite')
    }

    return this.json({ success: true })
  }

  @httpPost('/:groupUuid/invites/:inviteUuid/decline', TYPES.AuthMiddleware)
  public async declineGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.declineInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not decline invite')
    }

    return this.json({ success: true })
  }

  @httpGet('/invites/outbound', TYPES.AuthMiddleware)
  public async getOutboundUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.getOutboundInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group invites')
    }

    const projected = result.map((invite) => this.groupInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpGet('/invites', TYPES.AuthMiddleware)
  public async getUserInvites(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.getInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group invites')
    }

    const projected = result.map((invite) => this.groupInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpGet('/:groupUuid/invites', TYPES.AuthMiddleware)
  public async getGroupInvites(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.getInvitesForGroup({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group invites')
    }

    const projected = result.map((invite) => this.groupInviteProjector.projectFull(invite))

    return this.json({ invites: projected })
  }

  @httpDelete('/:groupUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async deleteGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.deleteInvite({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not delete invite')
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
