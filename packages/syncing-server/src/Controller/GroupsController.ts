import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { Request, Response } from 'express'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'

@controller('/groups')
export class GroupsController extends BaseHttpController {
  constructor(private groupsService: GroupServiceInterface) {
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

  @httpPost('/:groupUuid/users', TYPES.AuthMiddleware)
  public async addUserToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupsService.addUserToGroup({
      groupUuid: request.params.groupUuid,
      ownerUuid: response.locals.user.uuid,
      inviteeUuid: request.body.inviteeUuid,
      encryptedGroupKey: request.body.encryptedGroupKey,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupUser: result })
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getUserGroups(
    _request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupsService.getUserGroups(response.locals.user.uuid)

    if (!result) {
      return this.errorResponse(500, 'Could not get user groups')
    }

    return this.json({ groups: result })
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
