import { RemovedFileDescription } from '../File/RemovedFileDescription'

export interface FileRemoverInterface {
  remove(filePath: string): Promise<number>
  markFilesToBeRemoved(userUuid: string): Promise<Array<RemovedFileDescription>>
}
