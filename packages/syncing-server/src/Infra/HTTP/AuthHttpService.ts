import { KeyParamsData } from '@standardnotes/responses'
import { AxiosInstance } from 'axios'

import { AuthHttpServiceInterface } from '../../Domain/Auth/AuthHttpServiceInterface'

export class AuthHttpService implements AuthHttpServiceInterface {
  constructor(private httpClient: AxiosInstance, private authServerUrl: string) {}

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
