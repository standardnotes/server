import { Request } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpGet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { GetSetting } from '../../Domain/UseCase/GetSetting/GetSetting'
import { GetUserFeatures } from '../../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { MapperInterface } from '@standardnotes/domain-core'
import { Setting } from '../../Domain/Setting/Setting'
import { SettingHttpRepresentation } from '../../Mapping/Http/SettingHttpRepresentation'

@controller('/internal')
export class AnnotatedInternalController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetUserFeatures) private doGetUserFeatures: GetUserFeatures,
    @inject(TYPES.Auth_GetSetting) private doGetSetting: GetSetting,
    @inject(TYPES.Auth_SettingHttpMapper)
    private settingHttpMapper: MapperInterface<Setting, SettingHttpRepresentation>,
  ) {
    super()
  }

  @httpGet('/users/:userUuid/features')
  async getFeatures(request: Request): Promise<results.JsonResult> {
    const result = await this.doGetUserFeatures.execute({
      userUuid: request.params.userUuid,
      offline: false,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpGet('/users/:userUuid/settings/:settingName')
  async getSetting(request: Request): Promise<results.JsonResult> {
    const resultOrError = await this.doGetSetting.execute({
      userUuid: request.params.userUuid,
      settingName: request.params.settingName,
      allowSensitiveRetrieval: true,
      decrypted: true,
    })

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

    const settingAndValue = resultOrError.getValue()

    const settingHttpRepresentation = {
      ...this.settingHttpMapper.toProjection(settingAndValue.setting),
      value: settingAndValue.decryptedValue,
    }

    return this.json(settingHttpRepresentation)
  }
}
