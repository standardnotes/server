import { GroupUser } from '../Domain/GroupUser/Model/GroupUser'
import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import {
  BaseHttpController,
  controller,
  httpPost,
  results,
  httpDelete,
  httpPatch,
  httpGet,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Group } from '../Domain/Group/Model/Group'
import { GroupProjection } from '../Projection/GroupProjection'
import { GroupUserProjection } from '../Projection/GroupUserProjection'
import { GroupUserServiceInterface } from '../Domain/GroupUser/Service/GroupUserServiceInterface'
import { CreateGroupFileReadValetToken } from '../Domain/UseCase/CreateGroupFileValetToken/CreateGroupFileReadValetToken'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
    @inject(TYPES.GroupUserService) private groupUserService: GroupUserServiceInterface,
    @inject(TYPES.GroupProjector) private groupProjector: ProjectorInterface<Group, GroupProjection>,
    @inject(TYPES.GroupUserProjector) private groupUserProjector: ProjectorInterface<GroupUser, GroupUserProjection>,
    @inject(TYPES.CreateGroupFileReadValetToken) private createGroupFileReadValetToken: CreateGroupFileReadValetToken,
  ) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getGroups(_request: Request, response: Response): Promise<results.JsonResult> {
    const groups = await this.groupService.getGroups({
      userUuid: response.locals.user.uuid,
    })

    return this.json({
      groups: groups.map((group) => this.groupProjector.projectFull(group)),
    })
  }

  @httpPost('/:groupUuid/valet-tokens', TYPES.AuthMiddleware)
  public async getValetTokenForGroupFile(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const valetTokenResult = await this.createGroupFileReadValetToken.execute({
      userUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      fileUuid: request.body.file_uuid,
      remoteIdentifier: request.body.remote_identifier,
    })

    if (valetTokenResult.success === false) {
      return this.errorResponse(400, `Failed to create group valet token: ${valetTokenResult.reason}`)
    }

    return this.json({
      valetToken: valetTokenResult.valetToken,
    })
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createGroup(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.createGroup({
      userUuid: response.locals.user.uuid,
      groupUuid: request.body.group_uuid,
      groupKeyTimestamp: request.body.group_key_timestamp,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create group')
    }

    const groupUser = await this.groupUserService.addGroupUser({
      groupUuid: result.uuid,
      userUuid: response.locals.user.uuid,
      permissions: 'admin',
    })

    if (!groupUser) {
      return this.errorResponse(400, 'Could not add user to group')
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
      groupKeyTimestamp: request.body.group_key_timestamp,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not update group')
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
      return this.errorResponse(400, 'Could not delete group')
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
