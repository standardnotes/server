import { Request, Response } from 'express'
import { BaseHttpController, controller, results, httpDelete, httpGet } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { SharedVaultUserServiceInterface } from '../Domain/SharedVaultUser/Service/SharedVaultUserServiceInterface'
import { SharedVaultUserProjector } from '../Projection/SharedVaultUserProjector'

@controller('/shared-vaults/:sharedVaultUuid/users')
export class SharedVaultUsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.SharedVaultUserService) private sharedVaultUserService: SharedVaultUserServiceInterface,
    @inject(TYPES.SharedVaultUserProjector) private sharedVaultUserProjector: SharedVaultUserProjector,
  ) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getSharedVaultUsers(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultUserService.getSharedVaultUsersForSharedVault({
      originatorUuid: response.locals.user.uuid,
      sharedVaultUuid: request.params.sharedVaultUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get shared vault users')
    }

    const { users, isAdmin } = result

    const projected = users.map((sharedVaultUser) =>
      this.sharedVaultUserProjector.projectAsDisplayableUserForOtherSharedVaultMembers(sharedVaultUser, isAdmin),
    )

    return this.json({ users: projected })
  }

  @httpDelete('/:userUuid', TYPES.AuthMiddleware)
  public async deleteSharedVaultUser(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.sharedVaultUserService.deleteSharedVaultUser({
      sharedVaultUuid: request.params.sharedVaultUuid,
      userUuid: request.params.userUuid,
      originatorUuid: response.locals.user.uuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not delete user')
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
