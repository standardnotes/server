import { ControllerContainerInterface } from '@standardnotes/domain-core'
import { ErrorTag } from '@standardnotes/responses'
import { Request, Response } from 'express'

import { DeleteSetting } from '../../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { GetSetting } from '../../../Domain/UseCase/GetSetting/GetSetting'
import { GetSettings } from '../../../Domain/UseCase/GetSettings/GetSettings'
import { UpdateSetting } from '../../../Domain/UseCase/UpdateSetting/UpdateSetting'
import { BaseHttpController, results } from 'inversify-express-utils'
import { EncryptionVersion } from '../../../Domain/Encryption/EncryptionVersion'

export class BaseSettingsController extends BaseHttpController {
  constructor(
    protected doGetSettings: GetSettings,
    protected doGetSetting: GetSetting,
    protected doUpdateSetting: UpdateSetting,
    protected doDeleteSetting: DeleteSetting,
    private controllerContainer?: ControllerContainerInterface,
  ) {
    super()

    if (this.controllerContainer !== undefined) {
      this.controllerContainer.register('auth.users.getSettings', this.getSettings.bind(this))
      this.controllerContainer.register('auth.users.getSetting', this.getSetting.bind(this))
      this.controllerContainer.register('auth.users.updateSetting', this.updateSetting.bind(this))
      this.controllerContainer.register('auth.users.deleteSetting', this.deleteSetting.bind(this))
    }
  }

  async getSettings(request: Request, response: Response): Promise<results.JsonResult> {
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

    const { userUuid } = request.params
    const result = await this.doGetSettings.execute({ userUuid })

    return this.json(result)
  }

  async getSetting(request: Request, response: Response): Promise<results.JsonResult> {
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

    const { userUuid, settingName } = request.params
    const resultOrError = await this.doGetSetting.execute({ userUuid, settingName: settingName.toUpperCase() })
    if (resultOrError.isFailed()) {
      return this.json(
        {
          error: {
            message: resultOrError.getError(),
          },
        },
        400,
      )
    }

    return this.json({
      success: true,
      ...resultOrError.getValue(),
    })
  }

  async updateSetting(request: Request, response: Response): Promise<results.JsonResult | results.StatusCodeResult> {
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

    const { name, value, serverEncryptionVersion = EncryptionVersion.Default, sensitive = false } = request.body

    const props = {
      name,
      unencryptedValue: value,
      serverEncryptionVersion,
      sensitive,
    }

    const { userUuid } = request.params
    const result = await this.doUpdateSetting.execute({
      userUuid,
      props,
    })

    if (result.success) {
      return this.json({ setting: result.setting }, result.statusCode)
    }

    return this.json(result, result.statusCode)
  }

  async deleteSetting(request: Request, response: Response): Promise<results.JsonResult> {
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

    const { userUuid, settingName } = request.params

    const result = await this.doDeleteSetting.execute({
      userUuid,
      settingName,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }
}
