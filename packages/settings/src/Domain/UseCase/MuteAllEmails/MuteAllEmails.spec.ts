import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { MuteAllEmails } from './MuteAllEmails'

describe('MuteAllEmails', () => {
  let settingRepository: SettingRepositoryInterface

  const createUseCase = () => new MuteAllEmails(settingRepository)

  beforeEach(() => {
    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.setValueOnMultipleSettings = jest.fn()
  })

  it('should mute all email settings for a given user', async () => {
    const result = await createUseCase().execute({ userUuid: '84c0f8e8-544a-4c7e-9adf-26209303bc1d' })

    expect(result.isFailed()).toBeFalsy()
    expect(settingRepository.setValueOnMultipleSettings).toHaveBeenCalled()
  })

  it('should not mute all email settings for an invalid user uuid', async () => {
    const result = await createUseCase().execute({ userUuid: '1-2-3' })

    expect(result.isFailed()).toBeTruthy()
    expect(settingRepository.setValueOnMultipleSettings).not.toHaveBeenCalled()
  })
})
