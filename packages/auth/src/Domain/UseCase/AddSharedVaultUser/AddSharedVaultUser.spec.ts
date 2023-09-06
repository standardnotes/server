import { Result, SharedVaultUser } from '@standardnotes/domain-core'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'
import { AddSharedVaultUser } from './AddSharedVaultUser'

describe('AddSharedVaultUser', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface

  const createUseCase = () => new AddSharedVaultUser(sharedVaultUserRepository)

  beforeEach(() => {
    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.save = jest.fn()
  })

  it('should save shared vault user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'read',
      createdAt: 1,
      updatedAt: 2,
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sharedVaultUserRepository.save).toHaveBeenCalled()
  })

  it('should fail when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'read',
      createdAt: 1,
      updatedAt: 2,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid',
      permission: 'read',
      createdAt: 1,
      updatedAt: 2,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when permission is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'invalid',
      createdAt: 1,
      updatedAt: 2,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when timestamps are invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'read',
      createdAt: 'invalid' as unknown as number,
      updatedAt: 1,
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.save).not.toHaveBeenCalled()
  })

  it('should fail when shared vault user is invalid', async () => {
    const mock = jest.spyOn(SharedVaultUser, 'create')
    mock.mockReturnValue(Result.fail('Oops'))

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      permission: 'read',
      createdAt: 2,
      updatedAt: 1,
    })

    expect(result.isFailed()).toBeTruthy()

    mock.mockRestore()
  })
})
