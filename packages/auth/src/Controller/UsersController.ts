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
import { GetUser } from '../Domain/UseCase/GetUser'

@controller('/users')
export class UsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.UpdateUser) private updateUser: UpdateUser,
    @inject(TYPES.GetUser) private getUser: GetUser,
    @inject(TYPES.GetUserKeyParams) private getUserKeyParams: GetUserKeyParams,
    @inject(TYPES.DeleteAccount) private doDeleteAccount: DeleteAccount,
    @inject(TYPES.GetUserSubscription) private doGetUserSubscription: GetUserSubscription,
    @inject(TYPES.ClearLoginAttempts) private clearLoginAttempts: ClearLoginAttempts,
    @inject(TYPES.IncreaseLoginAttempts) private increaseLoginAttempts: IncreaseLoginAttempts,
    @inject(TYPES.ChangeCredentials) private changeCredentialsUseCase: ChangeCredentials,
  ) {
    super()
  }

  @httpPatch('/:userId', TYPES.AuthMiddleware)
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
      publicKey: request.body.public_key,
      signingPublicKey: request.body.signing_public_key,
    })

    if (updateResult.success) {
      response.setHeader('x-invalidate-cache', response.locals.user.uuid)
      response.send(updateResult.authResponse)

      return
    }

    return this.json(
      {
        error: {
          message: updateResult.errorMessage as string,
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

  @httpGet('/:userUuid/subscription', TYPES.ApiGatewayAuthMiddleware)
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

  @httpGet('/:userId', TYPES.AuthMiddleware)
  async getPkcCredentials(request: Request, response: Response): Promise<results.JsonResult | void> {
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

    const result = await this.getUser.execute({
      userUuid: request.params.userId,
    })

    if (!result.user) {
      return this.json({ success: false }, 400)
    }

    return this.json({
      uuid: result.user.uuid,
      email: result.user.email,
      public_key: result.user.publicKey,
      signing_public_key: result.user.signingPublicKey,
    })
  }

  @httpPut('/:userId/attributes/credentials', TYPES.AuthMiddleware)
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
      publicKey: request.body.new_public_key,
      signingPublicKey: request.body.new_signing_public_key,
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
