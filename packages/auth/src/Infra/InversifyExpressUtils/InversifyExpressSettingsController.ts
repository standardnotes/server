import { ErrorTag } from '@standardnotes/responses'
import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpDelete,
  httpGet,
  httpPut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { EncryptionVersion } from '../../Domain/Encryption/EncryptionVersion'
import { DeleteSetting } from '../../Domain/UseCase/DeleteSetting/DeleteSetting'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { GetSettings } from '../../Domain/UseCase/GetSettings/GetSettings'
import { UpdateSetting } from '../../Domain/UseCase/UpdateSetting/UpdateSetting'

@controller('/users/:userUuid')
export class InversifyExpressSettingsController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetSettings) protected doGetSettings: GetSettings,
    @inject(TYPES.Auth_GetSetting) protected doGetSetting: GetSetting,
    @inject(TYPES.Auth_UpdateSetting) protected doUpdateSetting: UpdateSetting,
    @inject(TYPES.Auth_DeleteSetting) protected doDeleteSetting: DeleteSetting,
  ) {
    super()
  }

  @httpGet('/settings', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
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

  @httpGet('/settings/:settingName', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
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
    const result = await this.doGetSetting.execute({ userUuid, settingName: settingName.toUpperCase() })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpPut('/settings', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
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

  @httpDelete('/settings/:settingName', TYPES.Auth_RequiredCrossServiceTokenMiddleware)
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
