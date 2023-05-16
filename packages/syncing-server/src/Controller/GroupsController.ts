import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { GroupUserServiceInterface } from '../Domain/GroupUser/Service/GroupUserService'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(private groupsService: GroupServiceInterface, private groupUserService: GroupUserServiceInterface) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async createGroup(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupsService.createGroup(response.locals.user.uuid)

    if (!result) {
      return this.errorResponse(500, 'Could not create group')
    }

    return this.json({ group: result })
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getUserGroupKeys(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserService.getUserGroupKeys({ userUuid: response.locals.user.uuid })

    if (!result) {
      return this.errorResponse(500, 'Could not get user groups')
    }

    return this.json({ groups: result })
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

    return this.json({ groupUser: result })
  }

  private errorResponse(status: number, message?: string, tag?: string) {
    return this.json(
      {
        error: { message, tag },
      },
      status,
    )
  }

  private notFoundJson(errorTag?: string): results.JsonResult {
    return this.json(
      {
        error: { message: 'Not found', tag: errorTag },
      },
      404,
    )
  }
}
