import { Revision } from '../Revision/Revision'

export interface DumpRepositoryInterface {
  getRevisionFromDumpPath(path: string): Promise<Revision | null>
  removeDump(path: string): Promise<void>
}
