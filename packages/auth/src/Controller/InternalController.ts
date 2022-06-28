import { Request, Response } from 'express'
import { inject } from 'inversify'
import {
  BaseHttpController,
  controller,
  httpGet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  results,
} from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { GetSetting } from '../Domain/UseCase/GetSetting/GetSetting'
import { GetUserFeatures } from '../Domain/UseCase/GetUserFeatures/GetUserFeatures'
import { MuteFailedBackupsEmails } from '../Domain/UseCase/MuteFailedBackupsEmails/MuteFailedBackupsEmails'
import { MuteMarketingEmails } from '../Domain/UseCase/MuteMarketingEmails/MuteMarketingEmails'
import { MuteSignInEmails } from '../Domain/UseCase/MuteSignInEmails/MuteSignInEmails'

@controller('/internal')
export class InternalController extends BaseHttpController {
  constructor(
    @inject(TYPES.GetUserFeatures) private doGetUserFeatures: GetUserFeatures,
    @inject(TYPES.GetSetting) private doGetSetting: GetSetting,
    @inject(TYPES.MuteFailedBackupsEmails) private doMuteFailedBackupsEmails: MuteFailedBackupsEmails,
    @inject(TYPES.MuteSignInEmails) private doMuteSignInEmails: MuteSignInEmails,
    @inject(TYPES.MuteMarketingEmails) private doMuteMarketingEmails: MuteMarketingEmails,
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
    const result = await this.doGetSetting.execute({
      userUuid: request.params.userUuid,
      settingName: request.params.settingName,
      allowSensitiveRetrieval: true,
    })

    if (result.success) {
      return this.json(result)
    }

    return this.json(result, 400)
  }

  @httpGet('/settings/email_backup/:settingUuid/mute')
  async muteFailedBackupsEmails(request: Request): Promise<results.JsonResult> {
    const { settingUuid } = request.params
    const result = await this.doMuteFailedBackupsEmails.execute({
      settingUuid,
    })

    if (result.success) {
      return this.json({ message: result.message })
    }

    return this.json({ message: result.message }, 404)
  }

  @httpGet('/settings/sign_in/:settingUuid/mute')
  async muteSignInEmails(request: Request): Promise<results.JsonResult> {
    const { settingUuid } = request.params
    const result = await this.doMuteSignInEmails.execute({
      settingUuid,
    })

    if (result.success) {
      return this.json({ message: result.message })
    }

    return this.json({ message: result.message }, 404)
  }

  @httpGet('/settings/marketing-emails/:settingUuid/mute')
  async muteMarketingEmails(request: Request, response: Response): Promise<void> {
    const { settingUuid } = request.params
    const result = await this.doMuteMarketingEmails.execute({
      settingUuid,
    })

    response.setHeader('content-type', 'text/html')

    if (result.success) {
      response.send(result.message)

      return
    }

    response.status(404).send(result.message)
  }
}
