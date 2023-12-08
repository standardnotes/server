import { Logger } from 'winston'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'
import { SendEventToClient } from '../SendEventToClient/SendEventToClient'
import { SendEventToClients } from './SendEventToClients'
import { Result, SharedVaultUser, SharedVaultUserPermission, Timestamps, Uuid } from '@standardnotes/domain-core'
import { DomainEventInterface } from '@standardnotes/domain-events'

describe('SendEventToClients', () => {
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let sendEventToClient: SendEventToClient
  let logger: Logger

  const createUseCase = () => new SendEventToClients(sharedVaultUserRepository, sendEventToClient, logger)

  beforeEach(() => {
    const sharedVaultUser = SharedVaultUser.create({
      permission: SharedVaultUserPermission.create('read').getValue(),
      sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      userUuid: Uuid.create('00000000-0000-0000-0000-000000000001').getValue(),
      isDesignatedSurvivor: false,
    }).getValue()

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findBySharedVaultUuid = jest.fn().mockReturnValue([sharedVaultUser])

    sendEventToClient = {} as jest.Mocked<SendEventToClient>
    sendEventToClient.execute = jest.fn().mockReturnValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should send event to all users', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
      originatingUserUuid: '00000000-0000-0000-0000-000000000003',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sendEventToClient.execute).toHaveBeenCalledTimes(1)
  })

  it('should send event to all users except the originating one', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
      originatingUserUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(sendEventToClient.execute).toHaveBeenCalledTimes(0)
  })

  it('should return error if shared vault uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: 'invalid',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
      originatingUserUuid: '00000000-0000-0000-0000-000000000001',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should return error if originating user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
      originatingUserUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should log error if sending event to client failed', async () => {
    sendEventToClient.execute = jest.fn().mockReturnValue(Result.fail('test error'))

    const useCase = createUseCase()

    const result = await useCase.execute({
      sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
      event: {
        type: 'test',
      } as jest.Mocked<DomainEventInterface>,
      originatingUserUuid: '00000000-0000-0000-0000-000000000003',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(logger.error).toHaveBeenCalledTimes(1)
  })
})
