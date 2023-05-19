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
import { GroupUserKeyServiceInterface } from '../Domain/GroupUserKey/Service/GroupUserKeyServiceInterface'
import { GroupUserKeyProjector } from '../Projection/GroupUserKeyProjector'

@controller('/groups/:groupUuid/users')
export class GroupUserKeysController extends BaseHttpController {
  constructor(
    @inject(TYPES.GroupUserKeyService) private groupUserKeyService: GroupUserKeyServiceInterface,
    @inject(TYPES.GroupUserKeyProjector) private groupUserKeyProjector: GroupUserKeyProjector,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  public async addUserToGroup(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.createGroupUserKey({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      userUuid: request.body.invitee_uuid,
      senderUuid: response.locals.user.uuid,
      senderPublicKey: request.body.sender_public_key,
      recipientPublicKey: request.body.recipient_public_key,
      encryptedGroupKey: request.body.encrypted_group_key,
      permissions: request.body.permissions,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not add user to group')
    }

    return this.json({ groupUserKey: await this.groupUserKeyProjector.projectFull(result) })
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getGroupUsers(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.getGroupUsers({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not get group users')
    }

    const { users, isAdmin } = result

    const projected = users.map((groupUserKey) =>
      this.groupUserKeyProjector.projectAsDisplayableUserForOtherGroupMembers(groupUserKey, isAdmin),
    )

    return this.json({ users: projected })
  }

  @httpPatch('/', TYPES.AuthMiddleware)
  public async updateKeysOfAllMembers(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.updateGroupUserKeysForAllMembers({
      originatorUuid: response.locals.user.uuid,
      groupUuid: request.params.groupUuid,
      updatedKeys: request.body.updated_keys,
    })

    if (!result) {
      return this.errorResponse(500, 'Could not update group member keys')
    }

    return this.json({ success: true })
  }

  @httpDelete('/:userUuid', TYPES.AuthMiddleware)
  public async deleteGroupUser(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.groupUserKeyService.deleteGroupUserKey({
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
