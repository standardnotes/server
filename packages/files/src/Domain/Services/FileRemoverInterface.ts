import { RemovedFileDescription } from '../File/RemovedFileDescription'

export interface FileRemoverInterface {
  remove(filePath: string): Promise<number>
  markFilesToBeRemoved(userOrSharedVaultUuid: string): Promise<Array<RemovedFileDescription>>
}
