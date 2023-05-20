import { GroupUser } from '../Domain/GroupUser/Model/GroupUser'
import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results, httpDelete, httpPatch } from 'inversify-express-utils'
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
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not create group')
    }

    const groupUser = await this.groupUserService.addGroupUser({
      groupUuid: result.uuid,
      userUuid: response.locals.user.uuid,
      permissions: 'admin',
    })

    if (!groupUser) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({
      group: this.groupProjector.projectFull(result),
      groupUser: this.groupUserProjector.projectFull(groupUser),
    })
  }

  @httpPatch('/:groupUuid', TYPES.AuthMiddleware)
  public async updateGroup(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.updateGroup({
      groupUuid: request.params.groupUuid,
      originatorUuid: response.locals.user.uuid,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not update group')
    }

    return this.json({
      group: this.groupProjector.projectFull(result),
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
