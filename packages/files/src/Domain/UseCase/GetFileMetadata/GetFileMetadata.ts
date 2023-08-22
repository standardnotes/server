import { Logger } from 'winston'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'
import { GetFileMetadataDTO } from './GetFileMetadataDTO'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

export class GetFileMetadata implements UseCaseInterface<number> {
  constructor(private fileDownloader: FileDownloaderInterface, private logger: Logger) {}

  async execute(dto: GetFileMetadataDTO): Promise<Result<number>> {
    try {
      const size = await this.fileDownloader.getFileSize(`${dto.ownerUuid}/${dto.resourceRemoteIdentifier}`)

      return Result.ok(size)
    } catch (error) {
      this.logger.error(`Could not get file metadata for resource: ${dto.ownerUuid}/${dto.resourceRemoteIdentifier}`)

      return Result.fail('Could not get file metadata')
    }
  }
}
