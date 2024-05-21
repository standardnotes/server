import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { FileDownloaderInterface } from '../../Services/FileDownloaderInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { StreamDownloadFileDTO } from './StreamDownloadFileDTO'
import { StreamDownloadFileResponse } from './StreamDownloadFileResponse'
import { ValetTokenRepositoryInterface } from '../../ValetToken/ValetTokenRepositoryInterface'

@injectable()
export class StreamDownloadFile implements UseCaseInterface {
  constructor(
    @inject(TYPES.Files_FileDownloader) private fileDownloader: FileDownloaderInterface,
    @inject(TYPES.Files_ValetTokenRepository) private valetTokenRepository: ValetTokenRepositoryInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {}

  async execute(dto: StreamDownloadFileDTO): Promise<StreamDownloadFileResponse> {
    try {
      const readStream = await this.fileDownloader.createDownloadStream(
        `${dto.ownerUuid}/${dto.resourceRemoteIdentifier}`,
        dto.startRange,
        dto.endRange,
      )

      if (dto.endRange === dto.endRangeOfFile) {
        await this.valetTokenRepository.markAsUsed(dto.valetToken)
      }

      return {
        success: true,
        readStream,
      }
    } catch (error) {
      this.logger.error(
        `Could not create a download stream for resource: ${dto.ownerUuid}/${dto.resourceRemoteIdentifier}`,
      )

      return {
        success: false,
        message: 'Could not create download stream',
      }
    }
  }
}
