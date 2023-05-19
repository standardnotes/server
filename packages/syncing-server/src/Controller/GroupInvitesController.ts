import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results, httpDelete, httpGet } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { GroupInviteServiceInterface } from '../Domain/GroupInvite/Service/GroupInviteServiceInterface'
import { GroupInviteProjector } from '../Projection/GroupInviteProjector'

@controller('/groups/invites')
export class GroupInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupInviteService) private groupInviteService: GroupInviteServiceInterface,
    @inject(TYPES.GroupInviteProjector) private groupInviteProjector: GroupInviteProjector,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async addUserToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.createGroupInvite({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      userUuid: request.body.invitee_uuid,
      inviterUuid: response.locals.user.uuid,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupInvite: await this.groupInviteProjector.projectFull(result) })
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getGroupInvites(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.getGroupInvites({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group users')
    }

    const { users } = result

    const projected = users.map((groupInvite) => this.groupInviteProjector.projectFull(groupInvite))

    return this.json({ users: projected })
  }

  @httpDelete('/:userUuid', TYPES.AuthMiddleware)
  public async deleteGroupInvite(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupInviteService.deleteGroupInvite({
      groupUuid: request.params.groupUuid,
      userUuid: request.params.userUuid,
      originatorUuid: response.locals.user.uuid,
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
