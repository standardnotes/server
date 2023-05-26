import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { RemoveFileDTO } from './RemoveFileDTO'
import { RemoveFileResponse } from './RemoveFileResponse'

@injectable()
export class RemoveFile implements UseCaseInterface {
  constructor(
    @inject(TYPES.Files_FileRemover) private fileRemover: FileRemoverInterface,
    @inject(TYPES.Files_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Files_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {}

  async execute(dto: RemoveFileDTO): Promise<RemoveFileResponse> {
    try {
      this.logger.debug(`Removing file: ${dto.resourceRemoteIdentifier}`)

      const filePath = `${dto.userUuid}/${dto.resourceRemoteIdentifier}`

      const removedFileSize = await this.fileRemover.remove(filePath)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileRemovedEvent({
          userUuid: dto.userUuid,
          filePath: `${dto.userUuid}/${dto.resourceRemoteIdentifier}`,
          fileName: dto.resourceRemoteIdentifier,
          fileByteSize: removedFileSize,
          regularSubscriptionUuid: dto.regularSubscriptionUuid,
        }),
      )

      return {
        success: true,
      }
    } catch (error) {
      this.logger.error(`Could not remove resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`)

      return {
        success: false,
        message: 'Could not remove resource',
      }
    }
  }
}
