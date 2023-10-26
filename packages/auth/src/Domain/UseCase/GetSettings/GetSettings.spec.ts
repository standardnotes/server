import { Uuid, Timestamps } from '@standardnotes/domain-core'
import { SettingName } from '@standardnotes/settings'
import { Setting } from '../../Setting/Setting'
import { SettingCrypterInterface } from '../../Setting/SettingCrypterInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { GetSettings } from './GetSettings'

describe('GetSettings', () => {
  let settingRepository: SettingRepositoryInterface
  let settingCrypter: SettingCrypterInterface

  const createUseCase = () => new GetSettings(settingRepository, settingCrypter)

  beforeEach(() => {
    const unsensitiveSetting = Setting.create({
      name: SettingName.NAMES.LogSessionUserAgent,
      value: 'test',
      serverEncryptionVersion: 0,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: false,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    const sensitiveSetting = Setting.create({
      name: SettingName.NAMES.MfaSecret,
      value: 'test',
      serverEncryptionVersion: 1,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      sensitive: true,
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    settingRepository = {} as jest.Mocked<SettingRepositoryInterface>
    settingRepository.findAllByUserUuid = jest.fn().mockReturnValue([unsensitiveSetting, sensitiveSetting])

    settingCrypter = {} as jest.Mocked<SettingCrypterInterface>
    settingCrypter.decryptSettingValue = jest.fn().mockReturnValue('decrypted')
  })

  it('should return settings', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      decrypted: false,
    })

    expect(result.isFailed()).toBeFalsy()
  })

  it('should return decrypted settings', async () => {
    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      decrypted: true,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(result.getValue()[0].decryptedValue).toEqual('decrypted')
  })

  it('should fail if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
      decrypted: false,
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
