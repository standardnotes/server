import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { FileMoverInterface } from '../../Services/FileMoverInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MoveFileDTO, isMoveFileFromUserToVaultDTO } from './MoveFileDTO'
import { MoveFileResponse } from './MoveFileResponse'

@injectable()
export class MoveFile implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileMover) private fileMover: FileMoverInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: MoveFileDTO): Promise<MoveFileResponse> {
    try {
      this.logger.debug(`Removing file: ${dto.resourceRemoteIdentifier}`)

      const srcPath = isMoveFileFromUserToVaultDTO(dto)
        ? `${dto.fromUserUuid}/${dto.resourceRemoteIdentifier}`
        : `${dto.fromVaultUuid}/${dto.resourceRemoteIdentifier}`

      const destPath = isMoveFileFromUserToVaultDTO(dto)
        ? `${dto.toVaultUuid}/${dto.resourceRemoteIdentifier}`
        : `${dto.toUserUuid}/${dto.resourceRemoteIdentifier}`

      await this.fileMover.moveFile(srcPath, destPath)

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
