import { TimerInterface } from '@standardnotes/time'
import { Result } from '@standardnotes/domain-core'

import { SharedVaultRepositoryInterface } from '../../SharedVault/SharedVaultRepositoryInterface'
import { AddUserToSharedVault } from '../AddUserToSharedVault/AddUserToSharedVault'
import { CreateSharedVault } from './CreateSharedVault'
import { SharedVault } from '../../SharedVault/SharedVault'

describe('CreateSharedVault', () => {
  let addUserToSharedVault: AddUserToSharedVault
  let sharedVaultRepository: SharedVaultRepositoryInterface
  let timer: TimerInterface

  const createUseCase = () => new CreateSharedVault(addUserToSharedVault, sharedVaultRepository, timer)

  beforeEach(() => {
    addUserToSharedVault = {} as jest.Mocked<AddUserToSharedVault>
    addUserToSharedVault.execute = jest.fn().mockResolvedValue(Result.ok())

    sharedVaultRepository = {} as jest.Mocked<SharedVaultRepositoryInterface>
    sharedVaultRepository.save = jest.fn()

    timer = {} as jest.Mocked<TimerInterface>
    timer.getTimestampInMicroseconds = jest.fn().mockReturnValue(123456789)
  })

  it('should return a failure result if the user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid-uuid',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Given value is not a valid uuid: invalid-uuid')
  })

  it('should return a failure result if the shared vault could not be created', async () => {
    const useCase = createUseCase()

    const mockSharedVault = jest.spyOn(SharedVault, 'create')
    mockSharedVault.mockImplementation(() => {
      return Result.fail('Oops')
    })

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')

    mockSharedVault.mockRestore()
  })

  it('should return a failure result if the user could not be added to the shared vault', async () => {
    const useCase = createUseCase()

    addUserToSharedVault.execute = jest.fn().mockResolvedValue(Result.fail('Oops'))

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBe(true)
    expect(result.getError()).toBe('Oops')
  })

  it('should create a shared vault', async () => {
    const useCase = createUseCase()

    await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(addUserToSharedVault.execute).toHaveBeenCalledWith({
      sharedVaultUuid: expect.any(String),
      userUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'admin',
    })
    expect(sharedVaultRepository.save).toHaveBeenCalled()
  })
})
