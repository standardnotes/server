import { SharedVaultValetTokenData, TokenEncoderInterface, ValetTokenOperation } from '@standardnotes/security'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { CreateSharedVaultFileValetToken } from './CreateSharedVaultFileValetToken'
import { SharedVault } from '../../../SharedVault/SharedVault'
import { SharedVaultUser } from '../../../SharedVault/User/SharedVaultUser'
import { SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'

describe('CreateSharedVaultFileValetToken', () => {
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let tokenEncoder: TokenEncoderInterface<SharedVaultValetTokenData>
  const valetTokenTTL = 3600
  let sharedVault: SharedVault
  let sharedVaultUser: SharedVaultUser

  const createUseCase = () =>
    new CreateSharedVaultFileValetToken(sharedVaultRepository, sharedVaultUserRepository, tokenEncoder, valetTokenTTL)

  beforeEach(() => {
    sharedVault = SharedVault.create({
      fileUploadBytesUsed: 2,
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(sharedVault)

    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<SharedVaultValetTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('encoded-token')
  })

  it('should return error when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid-uuid',
      remoteIdentifier: 'remote-identifier',
      operation: ValetTokenOperation.Read,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return error when user uuid is invalid', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: 'invalid-uuid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      remoteIdentifier: 'remote-identifier',
      operation: ValetTokenOperation.Read,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return error when shared vault is not found', async () => {
    sharedVaultRepository.findByUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      remoteIdentifier: 'remote-identifier',
      operation: ValetTokenOperation.Read,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Shared vault not found')
  })

  it('should return error when shared vault user is not found', async () => {
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(null)

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      remoteIdentifier: 'remote-identifier',
      operation: ValetTokenOperation.Read,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Shared vault user not found')
  })

  it('should return error when shared vault user does not have permission', async () => {
    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      remoteIdentifier: 'remote-identifier',
      operation: ValetTokenOperation.Write,
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('User does not have permission to perform this operation')
  })

  it('should create a shared vault file valet token', async () => {
    sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123, 123).getValue(),
    }).getValue()
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockResolvedValue(sharedVaultUser)

    const useCase = createUseCase()
    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      remoteIdentifier: 'remote-identifier',
      operation: ValetTokenOperation.Write,
    })

    expect(result.isFailed()).toBe(false)
    expect(result.getValue()).toBe('encoded-token')
  })

  describe('move operation', () => {
    beforeEach(() => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
    })

    it('should return error when move operation type is not specified', async () => {
      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
      })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Move operation type is required')
    })

    it('should return error when target uuid is missing on a shared-vault-to-shared-vault move operation', async () => {
      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-shared-vault',
      })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Shared vault to shared vault move target uuid is required')
    })

    it('should return error when target uuid is invalid on a shared-vault-to-shared-vault move operation', async () => {
      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-shared-vault',
        sharedVaultToSharedVaultMoveTargetUuid: 'invalid-uuid',
      })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
    })

    it('should return error when target shared vault user is not found on a shared-vault-to-shared-vault move operation', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
        .mockReturnValueOnce(null)

      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-shared-vault',
        sharedVaultToSharedVaultMoveTargetUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Shared vault target user not found')
    })

    it('should return error when target shared vault user does not have permission on a shared-vault-to-shared-vault move operation', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Read).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )

      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-shared-vault',
        sharedVaultToSharedVaultMoveTargetUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('User does not have permission to perform this operation')
    })

    it('should return error when target shared vault does not exist for shared-vault-to-shared-vault move operation', async () => {
      sharedVaultRepository.findByUuid = jest.fn().mockResolvedValueOnce(sharedVault).mockResolvedValueOnce(null)

      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-shared-vault',
        sharedVaultToSharedVaultMoveTargetUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBe(true)
      expect(result.getError()).toBe('Target shared vault not found')
    })

    it('should create move valet token for shared-vault-to-shared-vault operation', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )

      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-shared-vault',
        sharedVaultToSharedVaultMoveTargetUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBe(false)
      expect(result.getValue()).toBe('encoded-token')
    })

    it('should create move valet token for shared-vault-to-user operation', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )

      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'shared-vault-to-user',
        sharedVaultToSharedVaultMoveTargetUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBe(false)
      expect(result.getValue()).toBe('encoded-token')
    })

    it('should create move valet token for user-to-shared-vault operation', async () => {
      sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
        .fn()
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )
        .mockReturnValueOnce(
          SharedVaultUser.create({
            permission: SharedVaultUserPermission.create(SharedVaultUserPermission.PERMISSIONS.Write).getValue(),
            sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
            timestamps: Timestamps.create(123, 123).getValue(),
          }).getValue(),
        )

      const useCase = createUseCase()
      const result = await useCase.execute({
        userUuid: '00000000-0000-0000-0000-000000000000',
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        remoteIdentifier: 'remote-identifier',
        operation: ValetTokenOperation.Move,
        moveOperationType: 'user-to-shared-vault',
        sharedVaultToSharedVaultMoveTargetUuid: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBe(false)
      expect(result.getValue()).toBe('encoded-token')
    })
  })
})
