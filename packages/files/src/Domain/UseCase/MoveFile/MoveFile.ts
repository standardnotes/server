import { Logger } from 'winston'
import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { DomainEventPublisherInterface } from '@standardnotes/domain-events'

import { FileMoverInterface } from '../../Services/FileMoverInterface'
import { MoveFileDTO } from './MoveFileDTO'
import { DomainEventFactoryInterface } from '../../Event/DomainEventFactoryInterface'
import { GetFileMetadata } from '../GetFileMetadata/GetFileMetadata'

export class MoveFile implements UseCaseInterface<boolean> {
  constructor(
    private getFileMetadataUseCase: GetFileMetadata,
    private fileMover: FileMoverInterface,
    private domainEventPublisher: DomainEventPublisherInterface,
    private domainEventFactory: DomainEventFactoryInterface,
    private logger: Logger,
  ) {}

  async execute(dto: MoveFileDTO): Promise<Result<boolean>> {
    try {
      let fromSharedVaultUuid: Uuid | undefined = undefined
      if (dto.from.sharedVaultUuid !== undefined) {
        const fromSharedVaultUuidOrError = Uuid.create(dto.from.sharedVaultUuid)
        if (fromSharedVaultUuidOrError.isFailed()) {
          return Result.fail(fromSharedVaultUuidOrError.getError())
        }
        fromSharedVaultUuid = fromSharedVaultUuidOrError.getValue()
      }

      let toSharedVaultUuid: Uuid | undefined = undefined
      if (dto.to.sharedVaultUuid !== undefined) {
        const toSharedVaultUuidOrError = Uuid.create(dto.to.sharedVaultUuid)
        if (toSharedVaultUuidOrError.isFailed()) {
          return Result.fail(toSharedVaultUuidOrError.getError())
        }
        toSharedVaultUuid = toSharedVaultUuidOrError.getValue()
      }

      const fromOwnerUuidOrError = Uuid.create(dto.from.ownerUuid)
      if (fromOwnerUuidOrError.isFailed()) {
        return Result.fail(fromOwnerUuidOrError.getError())
      }
      const fromOwnerUuid = fromOwnerUuidOrError.getValue()

      const toOwnerUuidOrError = Uuid.create(dto.to.ownerUuid)
      if (toOwnerUuidOrError.isFailed()) {
        return Result.fail(toOwnerUuidOrError.getError())
      }
      const toOwnerUuid = toOwnerUuidOrError.getValue()

      const metadataResultOrError = await this.getFileMetadataUseCase.execute({
        resourceRemoteIdentifier: dto.resourceRemoteIdentifier,
        ownerUuid: fromOwnerUuid.value,
      })
      if (metadataResultOrError.isFailed()) {
        return Result.fail(metadataResultOrError.getError())
      }
      const fileSize = metadataResultOrError.getValue()

      const srcPath = `${fromSharedVaultUuid ? fromSharedVaultUuid.value : fromOwnerUuid.value}/${
        dto.resourceRemoteIdentifier
      }`
      const destPath = `${toSharedVaultUuid ? toSharedVaultUuid.value : toOwnerUuid.value}/${
        dto.resourceRemoteIdentifier
      }`

      this.logger.debug(`Moving file from ${srcPath} to ${destPath}`)

      await this.fileMover.moveFile(srcPath, destPath)

      await this.domainEventPublisher.publish(
        this.domainEventFactory.createSharedVaultFileMovedEvent({
          fileByteSize: fileSize,
          fileName: dto.resourceRemoteIdentifier,
          from: {
            sharedVaultUuid: fromSharedVaultUuid?.value,
            ownerUuid: fromOwnerUuid.value,
            filePath: srcPath,
          },
          to: {
            sharedVaultUuid: toSharedVaultUuid?.value,
            ownerUuid: toOwnerUuid.value,
            filePath: destPath,
          },
        }),
      )

      return Result.ok()
    } catch (error) {
      this.logger.error(`Could not move resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`)

      return Result.fail('Could not move resource')
    }
  }
}
