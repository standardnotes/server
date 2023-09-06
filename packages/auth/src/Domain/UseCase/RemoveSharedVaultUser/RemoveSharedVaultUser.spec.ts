import { SharedVaultUser } from '@standardnotes/domain-core'

import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'
import { RemoveSharedVaultUser } from './RemoveSharedVaultUser'

describe('RemoveSharedVaultUser', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface

  const createUseCase = () => new RemoveSharedVaultUser(sharedVaultUserRepository)

  beforeEach(() => {
    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedVaultUser>)
    sharedVaultUserRepository.remove = jest.fn()
  })

  it('should remove shared vault user', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sharedVaultUserRepository.remove).toHaveBeenCalled()
  })

  it('should fail when user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.remove).not.toHaveBeenCalled()
  })

  it('should fail when shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.remove).not.toHaveBeenCalled()
  })

  it('should fail when shared vault user is not found', async () => {
    sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid = jest.fn().mockReturnValue(null)

    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
    expect(sharedVaultUserRepository.remove).not.toHaveBeenCalled()
  })
})
