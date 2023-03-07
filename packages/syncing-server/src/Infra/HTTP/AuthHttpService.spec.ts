import 'reflect-metadata'

import { AxiosInstance } from 'axios'

import { AuthHttpService } from './AuthHttpService'
import { SettingName } from '@standardnotes/settings'

describe('AuthHttpService', () => {
  let httpClient: AxiosInstance

  const authServerUrl = 'https://auth-server'

  const createService = () => new AuthHttpService(httpClient, authServerUrl)

  beforeEach(() => {
    httpClient = {} as jest.Mocked<AxiosInstance>
    httpClient.request = jest.fn().mockReturnValue({ data: { foo: 'bar' } })
  })

  it('should send a request to auth service in order to get user key params', async () => {
    await createService().getUserKeyParams({
      email: 'test@test.com',
      authenticated: false,
    })

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      url: 'https://auth-server/users/params',
      params: {
        authenticated: false,
        email: 'test@test.com',
      },
      validateStatus: expect.any(Function),
    })
  })

  it('should send a request to auth service in order to get user setting', async () => {
    httpClient.request = jest.fn().mockReturnValue({
      data: {
        setting: [
          {
            uuid: '1-2-3',
            value: 'yes',
          },
        ],
      },
    })

    await createService().getUserSetting('1-2-3', SettingName.NAMES.MuteFailedBackupsEmails)

    expect(httpClient.request).toHaveBeenCalledWith({
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      url: 'https://auth-server/internal/users/1-2-3/settings/MUTE_FAILED_BACKUPS_EMAILS',
      validateStatus: expect.any(Function),
    })
  })

  it('should throw an error if a request to auth service in order to get user setting fails', async () => {
    let error = null
    try {
      await createService().getUserSetting('1-2-3', SettingName.NAMES.MuteFailedCloudBackupsEmails)
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })
})
