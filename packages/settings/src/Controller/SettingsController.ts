import { HttpResponse, HttpStatusCode } from '@standardnotes/api'

import { MuteAllEmails } from '../Domain/UseCase/MuteAllEmails/MuteAllEmails'
import { MuteAllEmailsRequestParams } from '../Infra/Http/MuteAllEmailsRequestParams'

export class SettingsController {
  constructor(private doMuteAllEmails: MuteAllEmails) {}

  async muteAllEmails(params: MuteAllEmailsRequestParams): Promise<HttpResponse> {
    const result = await this.doMuteAllEmails.execute({
      userUuid: params.userUuid,
    })

    if (result.isFailed()) {
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: {
            message: 'Could not mute emails.',
          },
        },
      }
    }

    return {
      status: HttpStatusCode.Success,
      data: { success: true },
    }
  }
}
