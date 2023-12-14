import { DomainEventPublisherInterface, FileQuotaRecalculatedEvent } from '@standardnotes/domain-events'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'
import { RecalculateQuota } from './RecalculateQuota'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'

describe('RecalculateQuota', () => {
  let fileDownloader: FileDownloaderInterface
  let domainEventPublisher: DomainEventPublisherInterface
  let domainEventFactory: DomainEventFactoryInterface

  const createUseCase = () => new RecalculateQuota(fileDownloader, domainEventPublisher, domainEventFactory)

  beforeEach(() => {
    fileDownloader = {} as jest.Mocked<FileDownloaderInterface>
    fileDownloader.listFiles = jest.fn().mockResolvedValue([
      {
        name: 'test-file',
        size: 123,
      },
    ])

    domainEventPublisher = {} as jest.Mocked<DomainEventPublisherInterface>
    domainEventPublisher.publish = jest.fn()

    domainEventFactory = {} as jest.Mocked<DomainEventFactoryInterface>
    domainEventFactory.createFileQuotaRecalculatedEvent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<FileQuotaRecalculatedEvent>)
  })

  it('publishes a file quota recalculated event', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeFalsy()
    expect(domainEventFactory.createFileQuotaRecalculatedEvent).toHaveBeenCalledWith({
      userUuid: '00000000-0000-0000-0000-000000000000',
      totalFileByteSize: 123,
    })
    expect(domainEventPublisher.publish).toHaveBeenCalled()
  })

  it('returns a failure result if user uuid is invalid', async () => {
    const useCase = createUseCase()

    const result = await useCase.execute({
      userUuid: 'invalid-user-uuid',
    })

    expect(result.isFailed()).toBeTruthy()
  })
})
