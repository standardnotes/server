import { KeyParamsData } from '@standardnotes/responses'
import { AxiosInstance } from 'axios'

import { AuthHttpServiceInterface } from '../../Domain/Auth/AuthHttpServiceInterface'

export class AuthHttpService implements AuthHttpServiceInterface {
  constructor(private httpClient: AxiosInstance, private authServerUrl: string) {}

  async getUserSetting(userUuid: string, settingName: string): Promise<{ uuid: string; value: string | null }> {
    const response = await this.httpClient.request({
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      url: `${this.authServerUrl}/internal/users/${userUuid}/settings/${settingName}`,
      validateStatus:
        /* istanbul ignore next */
        (status: number) => status >= 200 && status < 500,
    })

    if (!response.data.setting) {
      throw new Error('Missing user setting from auth service response')
    }

    return response.data.setting
  }

  async getUserKeyParams(dto: { email?: string; uuid?: string; authenticated: boolean }): Promise<KeyParamsData> {
    const keyParamsResponse = await this.httpClient.request({
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      url: `${this.authServerUrl}/users/params`,
      params: dto,
      validateStatus:
        /* istanbul ignore next */
        (status: number) => status >= 200 && status < 500,
    })

    return keyParamsResponse.data
  }
}
