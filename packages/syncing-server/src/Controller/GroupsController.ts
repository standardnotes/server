import { GroupUserKey } from './../Domain/GroupUserKey/Model/GroupUserKey'
import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
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
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Group } from '../Domain/Group/Model/Group'
import { GroupProjection } from '../Projection/GroupProjection'
import { GroupUserKeyProjection } from '../Projection/GroupUserKeyProjection'
import { GroupUserKeyServiceInterface } from '../Domain/GroupUserKey/Service/GroupUserKeyServiceInterface'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
    @inject(TYPES.GroupUserKeyService) private groupUserKeyService: GroupUserKeyServiceInterface,
    @inject(TYPES.GroupProjector) private groupProjector: ProjectorInterface<Group, GroupProjection>,
    @inject(TYPES.GroupUserKeyProjector)
    private groupUserKeyProjector: ProjectorInterface<GroupUserKey, GroupUserKeyProjection>,
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

    const groupUserKey = await this.groupUserKeyService.createGroupUserKey({
      groupUuid: result.uuid,
      originatorUuid: response.locals.user.uuid,
      userUuid: response.locals.user.uuid,
      senderUuid: response.locals.user.uuid,
      senderPublicKey: request.body.creator_public_key,
      recipientPublicKey: request.body.recipient_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
      permissions: 'write',
    })

    if (!groupUserKey) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({
      group: this.groupProjector.projectFull(result),
      groupUserKey: this.groupUserKeyProjector.projectFull(groupUserKey),
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

    const deleteUsersResult = await this.groupUserKeyService.deleteAllGroupUserKeysForGroup({
      groupUuid: request.params.groupUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!deleteUsersResult) {
      return this.errorResponse(500, 'Could not delete group users')
    }

    return this.json({ success: true })
  }

  @httpPatch('/user-keys', TYPES.AuthMiddleware)
  public async updateAllUserKeysOfUser(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.updateAllGroupUserKeysForCurrentUser({
      userUuid: response.locals.user.uuid,
      updatedKeys: request.body.updated_keys,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not update group member keys')
    }

    return this.json({ success: true })
  }

  @httpGet('/all-user-keys', TYPES.AuthMiddleware)
  public async getAllUserKeysForCurrentUser(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.getAllUserKeysForUser({
      userUuid: response.locals.user.uuid,
    })

    return this.json({
      groupUserKeys: result.map((groupUserKey) => this.groupUserKeyProjector.projectFull(groupUserKey)),
    })
  }

  @httpGet('/received-user-keys/:senderUuid', TYPES.AuthMiddleware)
  public async getUserKeysBySender(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.getUserKeysForUserBySender({
      userUuid: response.locals.user.uuid,
      senderUuid: request.params.senderUuid,
    })

    return this.json({
      groupUserKeys: result.map((groupUserKey) => this.groupUserKeyProjector.projectFull(groupUserKey)),
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
