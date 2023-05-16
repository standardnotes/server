import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(private groupsService: GroupServiceInterface) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createGroup(request: Request, response: Response): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupsService.createGroup({
      userUuid: response.locals.user.uuid,
      creatorPublicKey: request.body.creator_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not create group')
    }

    const groupUserKey = await this.groupsService.addUserToGroup({
      groupUuid: result.uuid,
      ownerUuid: response.locals.user.uuid,
      inviteeUuid: response.locals.user.uuid,
      senderPublicKey: request.body.creator_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
    })

    return this.json({ group: result, userKey: groupUserKey })
  }

  @httpPost('/:groupUuid/users', TYPES.AuthMiddleware)
  public async addUserToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupsService.addUserToGroup({
      groupUuid: request.params.groupUuid,
      ownerUuid: response.locals.user.uuid,
      inviteeUuid: request.body.invitee_uuid,
      encryptedGroupKey: request.body.encrypted_group_key,
      senderPublicKey: request.body.sender_public_key,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupUserKey: result })
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
