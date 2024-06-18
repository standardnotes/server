import { ControllerContainerInterface, Username } from '@standardnotes/domain-core'
import { Request, Response } from 'express'
import { BaseHttpController, results } from 'inversify-express-utils'

import { ChangeCredentials } from '../../../Domain/UseCase/ChangeCredentials/ChangeCredentials'
import { ClearLoginAttempts } from '../../../Domain/UseCase/ClearLoginAttempts'
import { DeleteAccount } from '../../../Domain/UseCase/DeleteAccount/DeleteAccount'
import { GetUserSubscription } from '../../../Domain/UseCase/GetUserSubscription/GetUserSubscription'
import { IncreaseLoginAttempts } from '../../../Domain/UseCase/IncreaseLoginAttempts'
import { ErrorTag } from '@standardnotes/responses'
import { ResponseLocals } from '../ResponseLocals'
import { CookieFactoryInterface } from '../../../Domain/Auth/Cookies/CookieFactoryInterface'

export class BaseUsersController extends BaseHttpController {
  constructor(
    protected doDeleteAccount: DeleteAccount,
    protected doGetUserSubscription: GetUserSubscription,
    protected clearLoginAttempts: ClearLoginAttempts,
    protected increaseLoginAttempts: IncreaseLoginAttempts,
    protected changeCredentialsUseCase: ChangeCredentials,
    protected cookieFactory: CookieFactoryInterface,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getSubscription', this.getSubscription.bind(this))
      this.controllerContainer.register('auth.users.updateCredentials', this.changeCredentials.bind(this))
      this.controllerContainer.register('auth.users.delete', this.deleteAccount.bind(this))
    }
  }

  async deleteAccount(request: Request, response: Response): Promise<results.JsonResult> {
    const locals = response.locals as ResponseLocals

    if (request.params.userUuid !== locals.user.uuid) {
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
    const locals = response.locals as ResponseLocals

    if (request.params.userUuid !== locals.user.uuid) {
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
    const usernameOrError = Username.create(locals.user.email)
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
      snjs: request.headers['x-snjs-version'] as string,
      application: request.headers['x-application-version'] as string,
    })

    if (changeCredentialsResult.isFailed()) {
      await this.increaseLoginAttempts.execute({ email: locals.user.email })

      return this.json(
        {
          error: {
            message: changeCredentialsResult.getError(),
          },
        },
        401,
      )
    }

    await this.clearLoginAttempts.execute({ email: locals.user.email })

    const changeCredentialsResultValue = changeCredentialsResult.getValue()
    const session = changeCredentialsResultValue.session

    response.setHeader('x-invalidate-cache', locals.user.uuid)
    if (session) {
      response.setHeader(
        'Set-Cookie',
        this.cookieFactory.createCookieHeaderValue({
          sessionUuid: session.uuid,
          accessToken: changeCredentialsResultValue.cookies?.accessToken as string,
          refreshToken: changeCredentialsResultValue.cookies?.refreshToken as string,
          refreshTokenExpiration: session.refreshExpiration,
        }),
      )
      return this.json({
        session: changeCredentialsResultValue.response?.sessionBody,
        key_params: changeCredentialsResultValue.response?.keyParams,
        user: changeCredentialsResultValue.response?.user,
      })
    }

    return this.json(changeCredentialsResultValue.legacyResponse)
  }
}
