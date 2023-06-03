import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { RemoveFileDTO, isRemoveUserFileDTO } from './RemoveFileDTO'
import { RemoveFileResponse } from './RemoveFileResponse'

@injectable()
export class RemoveFile implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileRemover) private fileRemover: FileRemoverInterface,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: RemoveFileDTO): Promise<RemoveFileResponse> {
    try {
      this.logger.debug(`Removing file: ${dto.resourceRemoteIdentifier}`)

      const ownerUuid = isRemoveUserFileDTO(dto) ? dto.userUuid : dto.sharedVaultUuid

      const filePath = `${ownerUuid}/${dto.resourceRemoteIdentifier}`

      const removedFileSize = await this.fileRemover.remove(filePath)

      if (isRemoveUserFileDTO(dto)) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createUserFileRemovedEvent({
            userUuid: dto.userUuid,
            filePath: `${dto.userUuid}/${dto.resourceRemoteIdentifier}`,
            fileName: dto.resourceRemoteIdentifier,
            fileByteSize: removedFileSize,
            regularSubscriptionUuid: dto.regularSubscriptionUuid,
          }),
        )
      } else {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createSharedVaultFileRemovedEvent({
            sharedVaultUuid: dto.sharedVaultUuid,
            filePath: `${dto.sharedVaultUuid}/${dto.resourceRemoteIdentifier}`,
            fileName: dto.resourceRemoteIdentifier,
            fileByteSize: removedFileSize,
          }),
        )
      }

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
