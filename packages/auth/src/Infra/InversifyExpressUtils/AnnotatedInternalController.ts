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

@controller('/internal')
export class AnnotatedInternalController extends BaseHttpController {
  constructor(
    @inject(TYPES.Auth_GetUserFeatures) private doGetUserFeatures: GetUserFeatures,
    @inject(TYPES.Auth_GetSetting) private doGetSetting: GetSetting,
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

    return this.json({
      success: true,
      ...resultOrError.getValue(),
    })
  }
}
