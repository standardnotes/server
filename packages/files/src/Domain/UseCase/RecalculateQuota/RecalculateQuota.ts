import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { RecalculateQuotaDTO } from './RecalculateQuotaDTO'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'

export class RecalculateQuota implements UseCaseInterface<void> {
  constructor(
    private fileDownloader: FileDownloaderInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
  ) {}

  async execute(dto: RecalculateQuotaDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const filesList = await this.fileDownloader.listFiles(userUuid.value)
    let totalFileByteSize = 0
    for (const file of filesList) {
      totalFileByteSize += file.size
    }

    const event = this.domainEventFactory.createFileQuotaRecalculatedEvent({
      userUuid: dto.userUuid,
      totalFileByteSize,
    })

    await this.domainEventPublisher.publish(event)

    return Result.ok()
  }
}
