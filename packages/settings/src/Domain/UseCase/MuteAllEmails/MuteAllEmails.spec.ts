import { Uuid } from '@standardnotes/domain-core'

import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { MuteAllEmails } from './MuteAllEmails'

describe('MuteAllEmails', () => {
  let settingRepository: SettingRepositoryInterface

  const createUseCase = () => new MuteAllEmails(settingRepository)

  beforeEach(() => {
    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.setValueOnMultipleSettings = jest.fn()
    settingRepository.findOneByNameAndValue = jest.fn().mockReturnValue({
      props: { userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue() },
    } as jest.Mocked<Setting>)
  })

  it('should mute all email settings for a given user', async () => {
    const result = await createUseCase().execute({ unsubscribeToken: 'foobar' })

    expect(result.isFailed()).toBeFalsy()
    expect(settingRepository.setValueOnMultipleSettings).toHaveBeenCalled()
  })

  it('should not mute all email settings if user was not found', async () => {
    settingRepository.findOneByNameAndValue = jest.fn().mockReturnValue(null)
    const result = await createUseCase().execute({ unsubscribeToken: 'foobar' })

    expect(result.isFailed()).toBeTruthy()
    expect(settingRepository.setValueOnMultipleSettings).not.toHaveBeenCalled()
  })

  it('should not mute all email settings if unsubscribe token is not provided', async () => {
    settingRepository.findOneByNameAndValue = jest.fn().mockReturnValue(null)
    const result = await createUseCase().execute({ unsubscribeToken: null as unknown as string })

    expect(result.isFailed()).toBeTruthy()
    expect(settingRepository.setValueOnMultipleSettings).not.toHaveBeenCalled()
  })
})
