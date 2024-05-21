import { DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'
import { RemoveFileDTO } from './RemoveFileDTO'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'
import { ValetTokenRepositoryInterface } from '../../ValetToken/ValetTokenRepositoryInterface'

@injectable()
export class RemoveFile implements UseCaseInterface<boolean> {
  constructor(
    @inject(TYPES.Files_FileRemover) private fileRemover: FileRemoverInterface,
    @inject(TYPES.Files_DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.Files_DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
    @inject(TYPES.Files_ValetTokenRepository) private valetTokenRepository: ValetTokenRepositoryInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {}

  async execute(dto: RemoveFileDTO): Promise<Result<boolean>> {
    const resourceUuid = dto.userInput?.resourceRemoteIdentifier ?? dto.vaultInput?.resourceRemoteIdentifier

    const ownerUuid = dto.userInput?.userUuid ?? dto.vaultInput?.sharedVaultUuid

    try {
      this.logger.debug(`Removing file: ${resourceUuid}`)

      const filePath = `${ownerUuid}/${resourceUuid}`

      const removedFileSize = await this.fileRemover.remove(filePath)

      if (dto.userInput !== undefined) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createFileRemovedEvent({
            userUuid: dto.userInput.userUuid,
            filePath: `${dto.userInput.userUuid}/${dto.userInput.resourceRemoteIdentifier}`,
            fileName: dto.userInput.resourceRemoteIdentifier,
            fileByteSize: removedFileSize,
          }),
        )
      } else if (dto.vaultInput !== undefined) {
        await this.domainEventPublisher.publish(
          this.domainEventFactory.createSharedVaultFileRemovedEvent({
            sharedVaultUuid: dto.vaultInput.sharedVaultUuid,
            vaultOwnerUuid: dto.vaultInput.vaultOwnerUuid,
            filePath: `${dto.vaultInput.sharedVaultUuid}/${dto.vaultInput.resourceRemoteIdentifier}`,
            fileName: dto.vaultInput.resourceRemoteIdentifier,
            fileByteSize: removedFileSize,
          }),
        )
      } else {
        return Result.fail('Could not remove file')
      }

      await this.valetTokenRepository.markAsUsed(dto.valetToken)

      return Result.ok()
    } catch (error) {
      this.logger.error(`Could not remove resource: ${resourceUuid} - ${(error as Error).message}`)

      return Result.fail('Could not remove resource')
    }
  }
}
