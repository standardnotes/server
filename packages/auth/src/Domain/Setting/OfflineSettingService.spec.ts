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
    offlineSettingRepository.deleteByNameAndValueExcludingEmail = jest.fn()

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
    expect(offlineSettingRepository.deleteByNameAndValueExcludingEmail).toHaveBeenCalledWith(
      OfflineSettingName.FeaturesToken,
      'test',
      'test@test.com',
    )
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
    expect(offlineSettingRepository.deleteByNameAndValueExcludingEmail).toHaveBeenCalledWith(
      OfflineSettingName.FeaturesToken,
      'test',
      'test@test.com',
    )
  })

  it('should delete stale offline settings mapped to the same token under a different email', async () => {
    await createService().createOrUpdate({
      email: 'new@test.com',
      name: OfflineSettingName.FeaturesToken,
      value: 'shared-token',
    })

    expect(offlineSettingRepository.deleteByNameAndValueExcludingEmail).toHaveBeenCalledWith(
      OfflineSettingName.FeaturesToken,
      'shared-token',
      'new@test.com',
    )
  })

  it('should not delete stale settings for non-extension-key offline settings', async () => {
    await createService().createOrUpdate({
      email: 'test@test.com',
      name: 'OTHER_SETTING' as OfflineSettingName,
      value: 'test',
    })

    expect(offlineSettingRepository.deleteByNameAndValueExcludingEmail).not.toHaveBeenCalled()
  })
})
