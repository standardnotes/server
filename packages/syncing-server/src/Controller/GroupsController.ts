import { GroupUser } from '../Domain/GroupUser/Model/GroupUser'
import { GroupServiceInterface } from '../Domain/Group/Service/GroupServiceInterface'
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
import { CreateGroupFileValetToken } from '../Domain/UseCase/CreateGroupFileValetToken/CreateGroupFileValetToken'
import { RemovedGroupUserServiceInterface } from '../Domain/RemovedGroupUser/Service/RemovedGroupUserServiceInterface'
import { Item } from '../Domain/Item/Item'
import { SavedItemProjection } from '../Projection/SavedItemProjection'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
    @inject(TYPES.RemovedGroupUserService) private removedGroupUserService: RemovedGroupUserServiceInterface,
    @inject(TYPES.GroupProjector) private groupProjector: ProjectorInterface<Group, GroupProjection>,
    @inject(TYPES.GroupUserProjector) private groupUserProjector: ProjectorInterface<GroupUser, GroupUserProjection>,
    @inject(TYPES.CreateGroupFileReadValetToken) private createGroupFileReadValetToken: CreateGroupFileValetToken,
    @inject(TYPES.SavedItemProjector) private savedItemProjector: ProjectorInterface<Item, SavedItemProjection>,
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

  @httpPost('/', TYPES.AuthMiddleware)
  public async createGroup(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.createGroup({
      userUuid: response.locals.user.uuid,
      vaultSystemIdentifier: request.body.vault_system_identifier,
      specifiedItemsKeyUuid: request.body.specified_items_key_uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not create group')
    }

    return this.json({
      group: this.groupProjector.projectFull(result.group),
      groupUser: this.groupUserProjector.projectFull(result.groupUser),
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

  @httpPost('/:groupUuid/add-item', TYPES.AuthMiddleware)
  public async addItemToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.addItemToGroup({
      groupUuid: request.params.groupUuid,
      itemUuid: request.body.item_uuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not add item to group')
    }

    return this.json({
      item: this.savedItemProjector.projectFull(result),
    })
  }

  @httpDelete('/:groupUuid/remove-item', TYPES.AuthMiddleware)
  public async removeItemFromGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.removeItemFromGroup({
      groupUuid: request.params.groupUuid,
      itemUuid: request.body.item_uuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not remove item from group')
    }

    return this.json({
      item: this.savedItemProjector.projectFull(result),
    })
  }

  @httpGet('/removed', TYPES.AuthMiddleware)
  public async getAllRemovedFromGroupsForCurrentUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.removedGroupUserService.getAllRemovedGroupUsersForUser({
      userUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get group users')
    }

    return this.json({
      removedGroups: result.map((removedUser) => {
        return {
          groupUuid: removedUser.groupUuid,
          removedAt: removedUser.createdAtTimestamp,
        }
      }),
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
      operation: request.body.operation,
      unencryptedFileSize: request.body.unencrypted_file_size,
      moveOperationType: request.body.move_operation_type,
      groupToGroupMoveTargetUuid: request.body.group_to_group_move_target_uuid,
    })

    if (valetTokenResult.success === false) {
      return this.errorResponse(400, `Failed to create group valet token: ${valetTokenResult.reason}`)
    }

    return this.json({
      valetToken: valetTokenResult.valetToken,
    })
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
