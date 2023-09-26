import { Result } from '@standardnotes/domain-core'

import { Revision } from '../Revision/Revision'

export interface DumpRepositoryInterface {
  getRevisionFromDumpPath(path: string): Promise<Result<Revision>>
  removeDump(path: string): Promise<void>
}
