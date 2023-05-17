import { GroupUserKey } from './../Domain/GroupUserKey/Model/GroupUserKey'
import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { Group } from '../Domain/Group/Model/Group'
import { GroupProjection } from '../Projection/GroupProjection'
import { GroupUserKeyProjection } from '../Projection/GroupUserKeyProjection'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupService) private groupService: GroupServiceInterface,
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

    const groupUserKey = await this.groupService.addUserToGroup({
      groupUuid: result.uuid,
      ownerUuid: response.locals.user.uuid,
      inviteeUuid: response.locals.user.uuid,
      senderPublicKey: request.body.creator_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
      permissions: 'write',
    })

    if (!groupUserKey) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({
      group: await this.groupProjector.projectFull(result),
      groupUserKey: await this.groupUserKeyProjector.projectFull(groupUserKey),
    })
  }

  @httpPost('/:groupUuid/users', TYPES.AuthMiddleware)
  public async addUserToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupService.addUserToGroup({
      groupUuid: request.params.groupUuid,
      ownerUuid: response.locals.user.uuid,
      inviteeUuid: request.body.invitee_uuid,
      encryptedGroupKey: request.body.encrypted_group_key,
      senderPublicKey: request.body.sender_public_key,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupUserKey: await this.groupUserKeyProjector.projectFull(result) })
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
