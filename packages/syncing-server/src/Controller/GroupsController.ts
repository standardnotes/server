import { GroupUser } from '../Domain/GroupUser/Model/GroupUser'
import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results, httpDelete } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Group } from '../Domain/Group/Model/Group'
import { GroupProjection } from '../Projection/GroupProjection'
import { GroupUserProjection } from '../Projection/GroupUserProjection'
import { GroupUserServiceInterface } from '../Domain/GroupUser/Service/GroupUserServiceInterface'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
    @inject(TYPES.GroupUserService) private groupUserService: GroupUserServiceInterface,
    @inject(TYPES.GroupProjector) private groupProjector: ProjectorInterface<Group, GroupProjection>,
    @inject(TYPES.GroupUserProjector)
    private groupUserProjector: ProjectorInterface<GroupUser, GroupUserProjection>,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createGroup(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.createGroup({
      userUuid: response.locals.user.uuid,
      creatorPublicKey: request.body.creator_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not create group')
    }

    const groupUser = await this.groupUserService.createGroupUser({
      groupUuid: result.uuid,
      originatorUuid: response.locals.user.uuid,
      userUuid: response.locals.user.uuid,
      inviterUuid: response.locals.user.uuid,
      permissions: 'write',
    })

    if (!groupUser) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({
      group: this.groupProjector.projectFull(result),
      groupUser: this.groupUserProjector.projectFull(groupUser),
    })
  }

  @httpDelete('/:groupUuid', TYPES.AuthMiddleware)
  public async deleteGroup(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.deleteGroup({
      groupUuid: request.params.groupUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not delete group')
    }

    const deleteUsersResult = await this.groupUserService.deleteAllGroupUsersForGroup({
      groupUuid: request.params.groupUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!deleteUsersResult) {
      return this.errorResponse(500, 'Could not delete group users')
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
