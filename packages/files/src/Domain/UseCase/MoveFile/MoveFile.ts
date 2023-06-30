import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { FileMoverInterface } from '../../Services/FileMoverInterface'
import { MoveFileDTO } from './MoveFileDTO'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

@injectable()
export class MoveFile implements UseCaseInterface<boolean> {
  constructor(
    @inject(TYPES.Files_FileMover) private fileMover: FileMoverInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {}

  async execute(dto: MoveFileDTO): Promise<Result<boolean>> {
    try {
      const srcPath = `${dto.fromUuid}/${dto.resourceRemoteIdentifier}`
      const destPath = `${dto.toUuid}/${dto.resourceRemoteIdentifier}`

      this.logger.debug(`Moving file from ${srcPath} to ${destPath}`)

      await this.fileMover.moveFile(srcPath, destPath)

      return Result.ok()
    } catch (error) {
      this.logger.error(`Could not move resource: ${dto.resourceRemoteIdentifier} - ${(error as Error).message}`)

      return Result.fail('Could not move resource')
    }
  }
}
