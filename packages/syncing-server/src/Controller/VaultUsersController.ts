import { Request, Response } from 'express'
import { BaseHttpController, controller, results, httpDelete, httpGet } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { inject } from 'inversify'
import { VaultUserServiceInterface } from '../Domain/VaultUser/Service/VaultUserServiceInterface'
import { VaultUserProjector } from '../Projection/VaultUserProjector'

@controller('/vaults/:vaultUuid/users')
export class VaultUsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.VaultUserService) private vaultUserService: VaultUserServiceInterface,
    @inject(TYPES.VaultUserProjector) private vaultUserProjector: VaultUserProjector,
  ) {
    super()
  }

  @httpGet('/', TYPES.AuthMiddleware)
  public async getVaultUsers(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultUserService.getVaultUsersForVault({
      originatorUuid: response.locals.user.uuid,
      vaultUuid: request.params.vaultUuid,
    })

    if (!result) {
      return this.errorResponse(400, 'Could not get vault users')
    }

    const { users, isAdmin } = result

    const projected = users.map((vaultUser) =>
      this.vaultUserProjector.projectAsDisplayableUserForOtherVaultMembers(vaultUser, isAdmin),
    )

    return this.json({ users: projected })
  }

  @httpDelete('/:userUuid', TYPES.AuthMiddleware)
  public async deleteVaultUser(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.vaultUserService.deleteVaultUser({
      vaultUuid: request.params.vaultUuid,
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
