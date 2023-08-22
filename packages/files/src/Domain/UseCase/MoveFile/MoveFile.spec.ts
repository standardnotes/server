import { DomainEventPublisherInterface, SharedVaultFileMovedEvent } from '@standardnotes/domain-events'
import { Result } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { MoveFile } from './MoveFile'
import { FileMoverInterface } from '../../Services/FileMoverInterface'
import { GetFileMetadata } from '../GetFileMetadata/GetFileMetadata'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

describe('MoveFile', () => {
  let fileMover: FileMoverInterface
  let getFileMetadataUseCase: GetFileMetadata
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  let logger: Logger

  const createUseCase = () =>
    new MoveFile(getFileMetadataUseCase, fileMover, domainEventPublisher, domainEventFactory, logger)

  beforeEach(() => {
    getFileMetadataUseCase = {} as jest.Mocked<GetFileMetadata>
    getFileMetadataUseCase.execute = jest.fn().mockReturnValue(Result.ok(1234))

    fileMover = {} as jest.Mocked<FileMoverInterface>
    fileMover.moveFile = jest.fn().mockReturnValue(413)

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
    logger.warn = jest.fn()

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createSharedVaultFileMovedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SharedVaultFileMovedEvent>)
  })

  it('should move a file', async () => {
    await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000001',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(fileMover.moveFile).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000/2-3-4',
      '00000000-0000-0000-0000-000000000001/2-3-4',
    )
  })

  it('should indicate an error if moving fails', async () => {
    fileMover.moveFile = jest.fn().mockImplementation(() => {
      throw new Error('oops')
    })

    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000001',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(result.isFailed()).toEqual(true)
  })

  it('should return an error if the from shared vault uuid is invalid', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: 'invalid',
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000001',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(result.isFailed()).toEqual(true)
  })

  it('should return an error if the to shared vault uuid is invalid', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: 'invalid',
        ownerUuid: '00000000-0000-0000-0000-000000000001',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(result.isFailed()).toEqual(true)
  })

  it('should return an error if the from owner uuid is invalid', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        ownerUuid: 'invalid',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000001',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(result.isFailed()).toEqual(true)
  })

  it('should return an error if the to owner uuid is invalid', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: 'invalid',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(result.isFailed()).toEqual(true)
  })

  it('should return an error if the file metadata cannot be retrieved', async () => {
    getFileMetadataUseCase.execute = jest.fn().mockReturnValue(Result.fail('oops'))

    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000000',
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000001',
      },
      moveType: 'shared-vault-to-shared-vault',
    })

    expect(result.isFailed()).toEqual(true)
  })

  it('should move file from user to shared vault', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      to: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000002',
      },
      moveType: 'user-to-shared-vault',
    })

    expect(fileMover.moveFile).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000/2-3-4',
      '00000000-0000-0000-0000-000000000001/2-3-4',
    )
    expect(result.isFailed()).toEqual(false)
  })

  it('should move file from shared vault to user', async () => {
    const result = await createUseCase().execute({
      resourceRemoteIdentifier: '2-3-4',
      from: {
        sharedVaultUuid: '00000000-0000-0000-0000-000000000001',
        ownerUuid: '00000000-0000-0000-0000-000000000002',
      },
      to: {
        ownerUuid: '00000000-0000-0000-0000-000000000000',
      },
      moveType: 'shared-vault-to-user',
    })

    expect(fileMover.moveFile).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001/2-3-4',
      '00000000-0000-0000-0000-000000000000/2-3-4',
    )
    expect(result.isFailed()).toEqual(false)
  })
})
