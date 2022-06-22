import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { GetFileMetadataDTO } from './GetFileMetadataDTO'
import { GetFileMetadataResponse } from './GetFileMetadataResponse'

@injectable()
export class GetFileMetadata implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileDownloader) private fileDownloader: FileDownloaderInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: GetFileMetadataDTO): Promise<GetFileMetadataResponse> {
    try {
      const size = await this.fileDownloader.getFileSize(`${dto.userUuid}/${dto.resourceRemoteIdentifier}`)

      return {
        success: true,
        size,
      }
    } catch (error) {
      this.logger.error(`Could not get file metadata for resource: ${dto.userUuid}/${dto.resourceRemoteIdentifier}`)
      return {
        success: false,
        message: 'Could not get file metadata.',
      }
    }
  }
}
