import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateUploadSessionDTO } from './CreateUploadSessionDTO'
import { CreateUploadSessionResponse } from './CreateUploadSessionResponse'
import { FileUploaderInterface } from '../../Services/FileUploaderInterface'
import { UploadRepositoryInterface } from '../../Upload/UploadRepositoryInterface'

@injectable()
export class CreateUploadSession implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileUploader) private fileUploader: FileUploaderInterface,
    @inject(TYPES.UploadRepository) private uploadRepository: UploadRepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: CreateUploadSessionDTO): Promise<CreateUploadSessionResponse> {
    try {
      this.logger.debug(`Creating upload session for resource: ${dto.resourceRemoteIdentifier}`)

      const filePath = `${dto.userUuid}/${dto.resourceRemoteIdentifier}`

      const uploadId = await this.fileUploader.createUploadSession(filePath)

      this.logger.debug(`Created upload session with id: ${uploadId}`)

      await this.uploadRepository.storeUploadSession(filePath, uploadId)

      return {
        success: true,
        uploadId,
      }
    } catch (error) {
      this.logger.error(
        `Could not create upload session for resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`,
      )

      return {
        success: false,
        message: 'Could not create upload session',
      }
    }
  }
}
