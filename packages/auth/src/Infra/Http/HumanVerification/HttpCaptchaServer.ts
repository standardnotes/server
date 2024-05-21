import { AxiosInstance } from 'axios'
import { Logger } from 'winston'

import { CaptchaServerInterface } from '../../../Domain/HumanVerification/CaptchaServerInterface'

export class HttpCaptchaServer implements CaptchaServerInterface {
  constructor(
    private logger: Logger,
    private httpClient: AxiosInstance,
    private captchaServerUrl?: string,
  ) {}

  async verify(hvmToken: string): Promise<boolean> {
    if (!this.captchaServerUrl) {
      return true
    }

    try {
      const response = await this.httpClient.request({
        method: 'GET',
        url: `${this.captchaServerUrl}/verify?token=${hvmToken}`,
      })
      const data = response.data

      return data.status === 'pass'
    } catch (error) {
      this.logger.error('Could not get result from captcha server', error)
      return false
    }
  }
}
