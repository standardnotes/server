import 'reflect-metadata'

import { CryptoNode } from '@standardnotes/sncrypto-node'

import { ValidateMfaToken } from './ValidateMfaToken'
import { ValidateMfaTokenDTO } from './ValidateMfaTokenDTO'
import { MfaSecretRepositoryInterface } from '../../Mfa/MfaSecretRepositoryInterface'

describe('ValidateMfaToken', () => {
  let useCase: ValidateMfaToken
  let mockCryptoNode: jest.Mocked<CryptoNode>
  let mockMfaSecretRepository: jest.Mocked<MfaSecretRepositoryInterface>

  beforeEach(() => {
    mockCryptoNode = {
      totpToken: jest.fn(),
    } as unknown as jest.Mocked<CryptoNode>

    mockMfaSecretRepository = {
      getMfaSecret: jest.fn(),
      setMfaSecret: jest.fn(),
      deleteMfaSecret: jest.fn(),
    }

    useCase = new ValidateMfaToken(mockCryptoNode, mockMfaSecretRepository)
  })

  describe('when authTokenVersion is less than 3', () => {
    it('should return success without validation', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 2,
      }

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(false)
      expect(mockMfaSecretRepository.getMfaSecret).not.toHaveBeenCalled()
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should return success when authTokenVersion is 1', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 1,
      }

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(false)
      expect(mockMfaSecretRepository.getMfaSecret).not.toHaveBeenCalled()
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })
  })

  describe('when authTokenVersion is 3 or higher', () => {
    it('should fail when no TOTP token is provided', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: undefined,
        authTokenVersion: 3,
      }

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('No TOTP token provided.')
      expect(mockMfaSecretRepository.getMfaSecret).not.toHaveBeenCalled()
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should fail when TOTP token is empty string', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '',
        authTokenVersion: 3,
      }

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('No TOTP token provided.')
      expect(mockMfaSecretRepository.getMfaSecret).not.toHaveBeenCalled()
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should fail when no MFA secret is found', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(null)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('No MFA secret found. Please generate a new secret first.')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should fail when TOTP token is invalid', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '654321'

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Invalid TOTP token.')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should succeed when TOTP token is valid', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '123456'

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)
      mockMfaSecretRepository.deleteMfaSecret.mockResolvedValue()

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(false)
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).toHaveBeenCalledWith('user-123')
    })
  })

  describe('when authTokenVersion is not provided', () => {
    it('should fail when no TOTP token is provided', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: undefined,
      }

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('No TOTP token provided.')
      expect(mockMfaSecretRepository.getMfaSecret).not.toHaveBeenCalled()
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should fail when no MFA secret is found', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
      }

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(null)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('No MFA secret found. Please generate a new secret first.')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should fail when TOTP token is invalid', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '654321'

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Invalid TOTP token.')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should succeed when TOTP token is valid', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '123456'

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)
      mockMfaSecretRepository.deleteMfaSecret.mockResolvedValue()

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(false)
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).toHaveBeenCalledWith('user-123')
    })
  })

  describe('error handling', () => {
    it('should handle errors from getMfaSecret gracefully', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      const error = new Error('Database connection failed')
      mockMfaSecretRepository.getMfaSecret.mockRejectedValue(error)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Failed to validate MFA token: Database connection failed')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should handle errors from totpToken gracefully', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const error = new Error('Crypto operation failed')

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockRejectedValue(error)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Failed to validate MFA token: Crypto operation failed')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should handle errors from deleteMfaSecret gracefully', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '123456'
      const error = new Error('Delete operation failed')

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)
      mockMfaSecretRepository.deleteMfaSecret.mockRejectedValue(error)

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Failed to validate MFA token: Delete operation failed')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).toHaveBeenCalledWith('user-123')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string as cached secret', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue('')

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('No MFA secret found. Please generate a new secret first.')
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).not.toHaveBeenCalled()
      expect(mockMfaSecretRepository.deleteMfaSecret).not.toHaveBeenCalled()
    })

    it('should handle authTokenVersion exactly equal to 3', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 3,
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '123456'

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)
      mockMfaSecretRepository.deleteMfaSecret.mockResolvedValue()

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(false)
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).toHaveBeenCalledWith('user-123')
    })

    it('should handle authTokenVersion greater than 3', async () => {
      const dto: ValidateMfaTokenDTO = {
        userUuid: 'user-123',
        totpToken: '123456',
        authTokenVersion: 5,
      }

      const cachedSecret = 'JBSWY3DPEHPK3PXP'
      const expectedToken = '123456'

      mockMfaSecretRepository.getMfaSecret.mockResolvedValue(cachedSecret)
      mockCryptoNode.totpToken.mockResolvedValue(expectedToken)
      mockMfaSecretRepository.deleteMfaSecret.mockResolvedValue()

      const result = await useCase.execute(dto)

      expect(result.isFailed()).toBe(false)
      expect(mockMfaSecretRepository.getMfaSecret).toHaveBeenCalledWith('user-123')
      expect(mockCryptoNode.totpToken).toHaveBeenCalledWith(cachedSecret, expect.any(Number), 6, 30)
      expect(mockMfaSecretRepository.deleteMfaSecret).toHaveBeenCalledWith('user-123')
    })
  })
})