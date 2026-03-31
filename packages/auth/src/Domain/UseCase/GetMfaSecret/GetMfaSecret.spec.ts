import 'reflect-metadata'

import { GetMfaSecret } from './GetMfaSecret'
import { CryptoNode } from '@standardnotes/sncrypto-node'
import { MfaSecretRepositoryInterface } from '../../Mfa/MfaSecretRepositoryInterface'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { Logger } from 'winston'
import { Setting } from '../../Setting/Setting'

describe('GetMfaSecret', () => {
  let getMfaSecret: GetMfaSecret
  let cryptoNode: jest.Mocked<CryptoNode>
  let mfaSecretRepository: jest.Mocked<MfaSecretRepositoryInterface>
  let settingRepository: jest.Mocked<SettingRepositoryInterface>
  let logger: jest.Mocked<Logger>

  beforeEach(() => {
    cryptoNode = {
      generateOtpSecret: jest.fn(),
    } as unknown as jest.Mocked<CryptoNode>

    mfaSecretRepository = {
      getMfaSecret: jest.fn(),
      setMfaSecret: jest.fn(),
      deleteMfaSecret: jest.fn(),
    }

    settingRepository = {
      findLastByNameAndUserUuid: jest.fn(),
    } as unknown as jest.Mocked<SettingRepositoryInterface>

    logger = {
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>

    getMfaSecret = new GetMfaSecret(cryptoNode, mfaSecretRepository, settingRepository, logger)
  })

  describe('execute', () => {
    it('should return error if MFA is already enabled', async () => {
      const userUuid = 'user-123'
      const existingSetting = {
        props: {
          value: 'EXISTINGSECRET123456789',
        },
      }

      settingRepository.findLastByNameAndUserUuid.mockResolvedValue(existingSetting as Setting)

      const result = await getMfaSecret.execute({ userUuid })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toEqual('Failed to generate MFA secret.')
      expect(settingRepository.findLastByNameAndUserUuid).toHaveBeenCalledWith('MFA_SECRET', userUuid)
      expect(mfaSecretRepository.getMfaSecret).not.toHaveBeenCalled()
      expect(cryptoNode.generateOtpSecret).not.toHaveBeenCalled()
    })

    it('should return cached secret if it exists', async () => {
      const userUuid = 'user-123'
      const cachedSecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

      settingRepository.findLastByNameAndUserUuid.mockResolvedValue(null)
      mfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)

      const result = await getMfaSecret.execute({ userUuid })

      expect(result.isFailed()).toBe(false)
      expect(result.getValue()).toEqual({ secret: cachedSecret })
      expect(mfaSecretRepository.getMfaSecret).toHaveBeenCalledWith(userUuid)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((cryptoNode as any).generateOtpSecret).not.toHaveBeenCalled()
      expect(logger.debug).toHaveBeenCalledWith(`Retrieved cached MFA secret for user ${userUuid}`)
    })

    it('should generate and cache new secret if none exists', async () => {
      const userUuid = 'user-123'
      const newSecret = 'NEWABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

      settingRepository.findLastByNameAndUserUuid.mockResolvedValue(null)
      mfaSecretRepository.getMfaSecret.mockResolvedValue(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(cryptoNode as any).generateOtpSecret.mockResolvedValue(newSecret)

      const result = await getMfaSecret.execute({ userUuid })

      expect(result.isFailed()).toBe(false)
      expect(result.getValue()).toEqual({ secret: newSecret })
      expect(mfaSecretRepository.getMfaSecret).toHaveBeenCalledWith(userUuid)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((cryptoNode as any).generateOtpSecret).toHaveBeenCalled()
      expect(mfaSecretRepository.setMfaSecret).toHaveBeenCalledWith(userUuid, newSecret, 300)
      expect(logger.debug).toHaveBeenCalledWith(`Generated new MFA secret for user ${userUuid}`)
    })

    it('should return error if generation fails', async () => {
      const userUuid = 'user-123'
      const error = new Error('Crypto generation failed')

      settingRepository.findLastByNameAndUserUuid.mockResolvedValue(null)
      mfaSecretRepository.getMfaSecret.mockResolvedValue(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(cryptoNode as any).generateOtpSecret.mockRejectedValue(error)

      const result = await getMfaSecret.execute({ userUuid })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toEqual('Failed to generate MFA secret.')
      expect(logger.error).toHaveBeenCalledWith(
        `Failed to generate MFA secret for user ${userUuid}: Error: Crypto generation failed`,
      )
    })
  })
})
