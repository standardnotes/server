import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { FileMoverInterface } from '../../Services/FileMoverInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MoveFileDTO } from './MoveFileDTO'
import { MoveFileResponse } from './MoveFileResponse'

@injectable()
export class MoveFile implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileMover) private fileMover: FileMoverInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: MoveFileDTO): Promise<MoveFileResponse> {
    try {
      const srcPath = `${dto.fromUuid}/${dto.resourceRemoteIdentifier}`
      const destPath = `${dto.toUuid}/${dto.resourceRemoteIdentifier}`

      this.logger.debug(`Moving file from ${srcPath} to ${destPath}`)

      await this.fileMover.moveFile(srcPath, destPath)

      return {
        success: true,
      }
    } catch (error) {
      this.logger.error(`Could not move resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`)

      return {
        success: false,
        message: 'Could not move resource',
      }
    }
  }
}
