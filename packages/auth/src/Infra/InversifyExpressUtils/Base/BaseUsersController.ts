import { ControllerContainerInterface, Username } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'

import { ChangeCredentials } from '../../../Domain/UseCase/ChangeCredentials/ChangeCredentials'
import { ClearLoginAttempts } from '../../../Domain/UseCase/ClearLoginAttempts'
import { DeleteAccount } from '../../../Domain/UseCase/DeleteAccount/DeleteAccount'
import { GetUserSubscription } from '../../../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { IncreaseLoginAttempts } from '../../../Domain/UseCase/IncreaseLoginAttempts'
import { UpdateUser } from '../../../Domain/UseCase/UpdateUser'
import { ErrorTag } from '@standardnotes/responses'

export class BaseUsersController extends BaseHttpController {
  constructor(
    protected updateUser: UpdateUser,
    protected doDeleteAccount: DeleteAccount,
    protected doGetUserSubscription: GetUserSubscription,
    protected clearLoginAttempts: ClearLoginAttempts,
    protected increaseLoginAttempts: IncreaseLoginAttempts,
    protected changeCredentialsUseCase: ChangeCredentials,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.update', this.update.bind(this))
      this.controllerContainer.register('auth.users.getSubscription', this.getSubscription.bind(this))
      this.controllerContainer.register('auth.users.updateCredentials', this.changeCredentials.bind(this))
      this.controllerContainer.register('auth.users.delete', this.deleteAccount.bind(this))
    }
  }

  async update(request: Request, response: Response): Promise<results.JsonResult> {
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

    if (request.params.userId !== response.locals.user.uuid) {
      return this.json(
        {
          error: {
            message: 'Operation not allowed.',
          },
        },
        401,
      )
    }

    const updateResult = await this.updateUser.execute({
      user: response.locals.user,
      updatedWithUserAgent: <string>request.headers['user-agent'],
      apiVersion: request.body.api,
    })

    if (updateResult.success) {
      response.setHeader('x-invalidate-cache', response.locals.user.uuid)

      return this.json(updateResult.authResponse)
    }

    return this.json(
      {
        error: {
          message: 'Could not update user.',
        },
      },
      400,
    )
  }

  async deleteAccount(request: Request, response: Response): Promise<results.JsonResult> {
    if (request.params.userUuid !== response.locals.user.uuid) {
      return this.json(
        {
          error: {
            message: 'Operation not allowed.',
          },
        },
        401,
      )
    }

    const result = await this.doDeleteAccount.execute({
      userUuid: request.params.userUuid,
    })

    if (result.isFailed()) {
      return this.json(
        {
          error: {
            message: result.getError(),
          },
        },
        400,
      )
    }

    return this.json({ message: result.getValue() }, 200)
  }

  async getSubscription(request: Request, response: Response): Promise<results.JsonResult> {
    if (request.params.userUuid !== response.locals.user.uuid) {
      return this.json(
        {
          error: {
            message: 'Operation not allowed.',
          },
        },
        401,
      )
    }

    const result = await this.doGetUserSubscription.execute({
      userUuid: request.params.userUuid,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  async changeCredentials(request: Request, response: Response): Promise<results.JsonResult> {
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

    if (!request.body.current_password) {
      return this.json(
        {
          error: {
            message:
              'Your current password is required to change your password. Please update your application if you do not see this option.',
          },
        },
        400,
      )
    }

    if (!request.body.new_password) {
      return this.json(
        {
          error: {
            message: 'Your new password is required to change your password. Please try again.',
          },
        },
        400,
      )
    }

    if (!request.body.pw_nonce) {
      return this.json(
        {
          error: {
            message: 'The change password request is missing new auth parameters. Please try again.',
          },
        },
        400,
      )
    }
    const usernameOrError = Username.create(response.locals.user.email)
    if (usernameOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: 'Invalid username.',
          },
        },
        400,
      )
    }
    const username = usernameOrError.getValue()

    const changeCredentialsResult = await this.changeCredentialsUseCase.execute({
      username,
      apiVersion: request.body.api,
      currentPassword: request.body.current_password,
      newPassword: request.body.new_password,
      newEmail: request.body.new_email,
      pwNonce: request.body.pw_nonce,
      kpCreated: request.body.created,
      kpOrigination: request.body.origination,
      updatedWithUserAgent: <string>request.headers['user-agent'],
      protocolVersion: request.body.version,
    })

    if (changeCredentialsResult.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: response.locals.user.email })

      return this.json(
        {
          error: {
            message: changeCredentialsResult.getError(),
          },
        },
        401,
      )
    }

    await this.clearLoginAttempts.execute({ email: response.locals.user.email })

    response.setHeader('x-invalidate-cache', response.locals.user.uuid)

    return this.json(changeCredentialsResult.getValue())
  }
}
