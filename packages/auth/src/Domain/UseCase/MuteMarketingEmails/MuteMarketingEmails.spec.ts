import 'reflect-metadata'
import { Setting } from '../../Setting/Setting'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'

import { MuteMarketingEmails } from './MuteMarketingEmails'

describe('MuteMarketingEmails', () => {
  let settingRepository: SettingRepositoryInterface

  const createUseCase = () => new MuteMarketingEmails(settingRepository)

  beforeEach(() => {
    const setting = {} as jest.Mocked<Setting>

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findOneByUuidAndNames = jest.fn().mockReturnValue(setting)
    settingRepository.save = jest.fn()
  })

  it('should not succeed if extension setting is not found', async () => {
    settingRepository.findOneByUuidAndNames = jest.fn().mockReturnValue(null)

    expect(await createUseCase().execute({ settingUuid: '1-2-3' })).toEqual({
      success: false,
      message: 'Could not find setting setting.',
    })
  })

  it('should update mute email setting on extension setting', async () => {
    expect(await createUseCase().execute({ settingUuid: '1-2-3' })).toEqual({
      success: true,
      message: 'These emails have been muted.',
    })

    expect(settingRepository.save).toHaveBeenCalledWith({
      value: 'muted',
      serverEncryptionVersion: 0,
    })
  })
})
