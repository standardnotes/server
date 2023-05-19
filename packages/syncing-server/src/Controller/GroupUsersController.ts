import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results, httpDelete, httpGet } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { GroupUserServiceInterface } from '../Domain/GroupUser/Service/GroupUserServiceInterface'
import { GroupUserProjector } from '../Projection/GroupUserProjector'

@controller('/groups/:groupUuid/users')
export class GroupUsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupUserService) private groupUserService: GroupUserServiceInterface,
    @inject(TYPES.GroupUserProjector) private groupUserProjector: GroupUserProjector,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async addUserToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserService.createGroupUser({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      userUuid: request.body.invitee_uuid,
      inviterUuid: response.locals.user.uuid,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupUser: await this.groupUserProjector.projectFull(result) })
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getGroupUsers(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserService.getGroupUsers({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group users')
    }

    const { users, isAdmin } = result

    const projected = users.map((groupUser) =>
      this.groupUserProjector.projectAsDisplayableUserForOtherGroupMembers(groupUser, isAdmin),
    )

    return this.json({ users: projected })
  }

  @httpDelete('/:userUuid', TYPES.AuthMiddleware)
  public async deleteGroupUser(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserService.deleteGroupUser({
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
