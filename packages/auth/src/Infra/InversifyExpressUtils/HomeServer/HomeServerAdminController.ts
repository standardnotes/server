import { ControllerContainerInterface, Username } from '@standardnotes/domain-core'
import { BaseHttpController, results } from 'inversify-express-utils'
import { SettingName } from '@standardnotes/settings'
import { Request } from 'express'

import { CreateOfflineSubscriptionToken } from '../../../Domain/UseCase/CreateOfflineSubscriptionToken/CreateOfflineSubscriptionToken'
import { CreateSubscriptionToken } from '../../../Domain/UseCase/CreateSubscriptionToken/CreateSubscriptionToken'
import { DeleteSetting } from '../../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { UserRepositoryInterface } from '../../../Domain/User/UserRepositoryInterface'

export class HomeServerAdminController extends BaseHttpController {
  constructor(
    protected doDeleteSetting: DeleteSetting,
    protected userRepository: UserRepositoryInterface,
    protected createSubscriptionToken: CreateSubscriptionToken,
    protected createOfflineSubscriptionToken: CreateOfflineSubscriptionToken,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('admin.getUser', this.getUser.bind(this))
      this.controllerContainer.register('admin.deleteMFASetting', this.deleteMFASetting.bind(this))
      this.controllerContainer.register('admin.createToken', this.createToken.bind(this))
      this.controllerContainer.register('admin.createOfflineToken', this.createOfflineToken.bind(this))
      this.controllerContainer.register('admin.disableEmailBackups', this.disableEmailBackups.bind(this))
    }
  }

  async getUser(request: Request): Promise<results.JsonResult> {
    const usernameOrError = Username.create(request.params.email ?? '')
    if (usernameOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: 'Missing email parameter.',
          },
        },
        400,
      )
    }
    const username = usernameOrError.getValue()

    const user = await this.userRepository.findOneByUsernameOrEmail(username)

    if (!user) {
      return this.json(
        {
          error: {
            message: `No user with email '${username.value}'.`,
          },
        },
        400,
      )
    }

    return this.json({
      uuid: user.uuid,
    })
  }

  async deleteMFASetting(request: Request): Promise<results.JsonResult> {
    const { userUuid } = request.params
    const { uuid, updatedAt } = request.body

    const result = await this.doDeleteSetting.execute({
      uuid,
      userUuid,
      settingName: SettingName.NAMES.MfaSecret,
      timestamp: updatedAt,
      softDelete: true,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  async createToken(request: Request): Promise<results.JsonResult> {
    const { userUuid } = request.params
    const result = await this.createSubscriptionToken.execute({
      userUuid,
    })

    return this.json({
      token: result.subscriptionToken.token,
    })
  }

  async createOfflineToken(request: Request): Promise<results.JsonResult | results.BadRequestResult> {
    const { email } = request.params
    const result = await this.createOfflineSubscriptionToken.execute({
      userEmail: email,
    })

    if (!result.success) {
      return this.badRequest()
    }

    return this.json({
      token: result.offlineSubscriptionToken.token,
    })
  }

  async disableEmailBackups(request: Request): Promise<results.BadRequestErrorMessageResult | results.OkResult> {
    const { userUuid } = request.params

    const result = await this.doDeleteSetting.execute({
      userUuid,
      settingName: SettingName.NAMES.EmailBackupFrequency,
    })

    if (result.success) {
      return this.ok()
    }

    return this.badRequest('No email backups found')
  }
}
