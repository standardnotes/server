import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { ErrorTag } from '@standardnotes/responses'
import { Request, Response } from 'express'

import { CreateListedAccount } from '../../../Domain/UseCase/CreateListedAccount/CreateListedAccount'
import { BaseHttpController, results } from 'inversify-express-utils'
import { ResponseLocals } from '../ResponseLocals'

export class BaseListedController extends BaseHttpController {
  constructor(
    protected doCreateListedAccount: CreateListedAccount,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.createListedAccount', this.createListedAccount.bind(this))
    }
  }

  async createListedAccount(_request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    if (locals.readOnlyAccess) {
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
      userUuid: locals.user.uuid,
      userEmail: locals.user.email,
    })

    return this.json({
      message: 'Listed account creation requested successfully.',
    })
  }
}
