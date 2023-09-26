import { MapperInterface, Result } from '@standardnotes/domain-core'
import { promises } from 'fs'

import { DumpRepositoryInterface } from '../../Domain/Dump/DumpRepositoryInterface'
import { Revision } from '../../Domain/Revision/Revision'

export class FSDumpRepository implements DumpRepositoryInterface {
  constructor(private revisionStringItemMapper: MapperInterface<Revision, string>) {}

  async getRevisionFromDumpPath(path: string): Promise<Result<Revision>> {
    try {
      const contents = (await promises.readFile(path)).toString()

      const revision = this.revisionStringItemMapper.toDomain(contents)

      return Result.ok(revision)
    } catch (error) {
      return Result.fail(`Failed to read dump file: ${(error as Error).message}`)
    }
  }

  async removeDump(path: string): Promise<void> {
    await promises.rm(path)
  }
}
