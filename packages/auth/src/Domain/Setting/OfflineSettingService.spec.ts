import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'
import { OfflineSetting } from './OfflineSetting'
import { OfflineSettingName } from './OfflineSettingName'
import { OfflineSettingRepositoryInterface } from './OfflineSettingRepositoryInterface'

import { OfflineSettingService } from './OfflineSettingService'

describe('OfflineSettingService', () => {
  let offlineSettingRepository: OfflineSettingRepositoryInterface
  let timer: TimerInterface
  let offlineSetting: OfflineSetting

  const createService = () => new OfflineSettingService(offlineSettingRepository, timer)

  beforeEach(() => {
    offlineSetting = {} as jest.Mocked<OfflineSetting>

    offlineSettingRepository = {} as jest.Mocked<OfflineSettingRepositoryInterface>
    offlineSettingRepository.findOneByNameAndEmail = jest.fn().mockReturnValue(null)
    offlineSettingRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123)
  })

  it('should save a new offline setting', async () => {
    await createService().createOrUpdate({
      email: 'test@test.com',
      name: OfflineSettingName.FeaturesToken,
      value: 'test',
    })

    expect(offlineSettingRepository.save).toHaveBeenCalledWith({
      email: 'test@test.com',
      name: 'FEATURES_TOKEN',
      value: 'test',
      createdAt: 123,
      updatedAt: 123,
      serverEncryptionVersion: 0,
    })
  })

  it('should update an existing offline setting', async () => {
    offlineSettingRepository.findOneByNameAndEmail = jest.fn().mockReturnValue(offlineSetting)

    await createService().createOrUpdate({
      email: 'test@test.com',
      name: OfflineSettingName.FeaturesToken,
      value: 'test',
    })

    expect(offlineSettingRepository.save).toHaveBeenCalledWith({
      value: 'test',
      updatedAt: 123,
    })
  })
})
