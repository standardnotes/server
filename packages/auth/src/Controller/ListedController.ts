import { inject } from 'inversify'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseHttpController, controller, httpPost, results } from 'inversify-express-utils'
import { Request, Response } from 'express'
import TYPES from '../Bootstrap/Types'
import { CreateListedAccount } from '../Domain/UseCase/CreateListedAccount/CreateListedAccount'
import { ErrorTag } from '@standardnotes/responses'

@controller('/listed')
export class ListedController extends BaseHttpController {
  constructor(@inject(TYPES.CreateListedAccount) private doCreateListedAccount: CreateListedAccount) {
    super()
  }

  @httpPost('/', TYPES.ApiGatewayAuthMiddleware)
  async createListedAccount(_request: Request, response: Response): Promise<results.JsonResult> {
    if (response.locals.readOnlyAccess) {
      return this.json(
        {
          error: {
            tag: ErrorTag.ReadOnlyAccess,
            message: 'Session has read-only access.',
          },
        },
        401,
      )
    }

    await this.doCreateListedAccount.execute({
      userUuid: response.locals.user.uuid,
      userEmail: response.locals.user.email,
    })

    return this.json({
      message: 'Listed account creation requested successfully.',
    })
  }
}
