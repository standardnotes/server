import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results, httpDelete, httpGet } from 'inversify-express-utils'
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
  public async createGroupInvitation(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.createGroupInvite({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      userUuid: request.body.invitee_uuid,
      inviterPublicKey: request.body.inviter_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
      inviteType: request.body.invite_type,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupInvite: this.groupInviteProjector.projectFull(result) })
  }

  @httpPost('/:groupUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async acceptGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.acceptGroupInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not accept invite')
    }

    return this.json({ success: true })
  }

  @httpDelete('/:groupUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async declineGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.declineGroupInvite({
      originatorUuid: response.locals.user.uuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not decline invite')
    }

    return this.json({ success: true })
  }

  @httpGet('/invites', TYPES.AuthMiddleware)
  public async getAllInvitesForCurrentUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.getGroupInvitesForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group users')
    }

    const projected = result.map((invite) => this.groupInviteProjector.projectFull(invite))

    return this.json({ users: projected })
  }

  @httpGet('/:groupUuid/invites', TYPES.AuthMiddleware)
  public async getGroupInvitesForGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.getGroupInvitesForGroup({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group users')
    }

    const projected = result.map((invite) => this.groupInviteProjector.projectFull(invite))

    return this.json({ users: projected })
  }

  @httpDelete('/:groupUuid/invites/:inviteUuid', TYPES.AuthMiddleware)
  public async deleteGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.deleteGroupInvite({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      inviteUuid: request.params.inviteUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not delete user')
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
