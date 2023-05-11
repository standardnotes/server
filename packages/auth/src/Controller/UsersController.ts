import { Request, Response } from 'express'
import { inject } from 'inversify'
import { ErrorTag } from '@standardnotes/responses'
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { DeleteAccount } from '../Domain/UseCase/DeleteAccount/DeleteAccount'
import { GetUserKeyParams } from '../Domain/UseCase/GetUserKeyParams/GetUserKeyParams'
import { UpdateUser } from '../Domain/UseCase/UpdateUser'
import { GetUserSubscription } from '../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { ClearLoginAttempts } from '../Domain/UseCase/ClearLoginAttempts'
import { IncreaseLoginAttempts } from '../Domain/UseCase/IncreaseLoginAttempts'
import { ChangeCredentials } from '../Domain/UseCase/ChangeCredentials/ChangeCredentials'

@controller('/users')
export class UsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_UpdateUser) private updateUser: UpdateUser,
    @inject(TYPES.Auth_GetUserKeyParams) private getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.Auth_DeleteAccount) private doDeleteAccount: DeleteAccount,
    @inject(TYPES.Auth_GetUserSubscription) private doGetUserSubscription: GetUserSubscription,
    @inject(TYPES.Auth_ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.Auth_IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.Auth_ChangeCredentials) private changeCredentialsUseCase: ChangeCredentials,
  ) {
    super()
  }

  @httpPatch('/:userId', TYPES.Auth_ApiGatewayAuthMiddleware)
  async update(request: Request, response: Response): Promise<results.JsonResult | void> {
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
      pwFunc: request.body.pw_func,
      pwAlg: request.body.pw_alg,
      pwCost: request.body.pw_cost,
      pwKeySize: request.body.pw_key_size,
      pwNonce: request.body.pw_nonce,
      pwSalt: request.body.pw_salt,
      kpOrigination: request.body.origination,
      kpCreated: request.body.created,
      version: request.body.version,
    })

    if (updateResult.success) {
      response.setHeader('x-invalidate-cache', response.locals.user.uuid)
      response.send(updateResult.authResponse)

      return
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

  @httpGet('/params')
  async keyParams(request: Request): Promise<results.JsonResult> {
    const email = 'email' in request.query ? <string>request.query.email : undefined
    const userUuid = 'uuid' in request.query ? <string>request.query.uuid : undefined

    if (!email && !userUuid) {
      return this.json(
        {
          error: {
            message: 'Missing mandatory request query parameters.',
          },
        },
        400,
      )
    }

    const result = await this.getUserKeyParams.execute({
      email,
      userUuid,
      authenticated: request.query.authenticated === 'true',
    })

    return this.json(result.keyParams)
  }

  @httpDelete('/:email')
  async deleteAccount(request: Request): Promise<results.JsonResult> {
    const result = await this.doDeleteAccount.execute({
      email: request.params.email,
    })

    return this.json({ message: result.message }, result.responseCode)
  }

  @httpGet('/:userUuid/subscription', TYPES.Auth_ApiGatewayAuthMiddleware)
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

  @httpPut('/:userId/attributes/credentials', TYPES.Auth_AuthMiddleware)
  async changeCredentials(request: Request, response: Response): Promise<results.JsonResult | void> {
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

    const changeCredentialsResult = await this.changeCredentialsUseCase.execute({
      user: response.locals.user,
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

    if (!changeCredentialsResult.success) {
      await this.increaseLoginAttempts.execute({ email: response.locals.user.email })

      return this.json(
        {
          error: {
            message: changeCredentialsResult.errorMessage,
          },
        },
        401,
      )
    }

    await this.clearLoginAttempts.execute({ email: response.locals.user.email })

    response.setHeader('x-invalidate-cache', response.locals.user.uuid)
    response.send(changeCredentialsResult.authResponse)
  }
}
