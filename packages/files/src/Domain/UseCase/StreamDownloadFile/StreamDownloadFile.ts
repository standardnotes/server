import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { StreamDownloadFileDTO, isStreamDownloadFileVaultOwned } from './StreamDownloadFileDTO'
import { StreamDownloadFileResponse } from './StreamDownloadFileResponse'

@injectable()
export class StreamDownloadFile implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileDownloader) private fileDownloader: FileDownloaderInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: StreamDownloadFileDTO): Promise<StreamDownloadFileResponse> {
    const ownerUuid = isStreamDownloadFileVaultOwned(dto) ? dto.vaultUuid : dto.userUuid
    try {
      const readStream = await this.fileDownloader.createDownloadStream(
        `${ownerUuid}/${dto.resourceRemoteIdentifier}`,
        dto.startRange,
        dto.endRange,
      )

      return {
        success: true,
        readStream,
      }
    } catch (error) {
      this.logger.error(`Could not create a download stream for resource: ${ownerUuid}/${dto.resourceRemoteIdentifier}`)

      return {
        success: false,
        message: 'Could not create download stream',
      }
    }
  }
}
