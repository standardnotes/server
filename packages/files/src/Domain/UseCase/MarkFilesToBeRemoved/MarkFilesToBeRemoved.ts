import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import { Result, UseCaseInterface } from '@standardnotes/domain-core'

import TYPES from '../../../Bootstrap/Types'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'
import { MarkFilesToBeRemovedDTO } from './MarkFilesToBeRemovedDTO'
import { RemovedFileDescription } from '../../File/RemovedFileDescription'

@injectable()
export class MarkFilesToBeRemoved implements UseCaseInterface<RemovedFileDescription[]> {
  constructor(
    @inject(TYPES.Files_FileRemover) private fileRemover: FileRemoverInterface,
    @inject(TYPES.Files_Logger) private logger: Logger,
  ) {}

  async execute(dto: MarkFilesToBeRemovedDTO): Promise<Result<RemovedFileDescription[]>> {
    try {
      this.logger.debug(`Marking files for later removal for user: ${dto.ownerUuid}`)

      const filesRemoved = await this.fileRemover.markFilesToBeRemoved(dto.ownerUuid)

      return Result.ok(filesRemoved)
    } catch (error) {
      this.logger.error(`Could not mark resources for removal: ${dto.ownerUuid} - ${(error as Error).message}`)

      return Result.fail('Could not mark resources for removal')
    }
  }
}
