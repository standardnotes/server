import { inject, injectable } from 'inversify'
import { promises } from 'fs'

import { FileRemoverInterface } from '../../Domain/Services/FileRemoverInterface'
import { RemovedFileDescription } from '../../Domain/File/RemovedFileDescription'
import TYPES from '../../Bootstrap/Types'

@injectable()
export class FSFileRemover implements FileRemoverInterface {
  constructor(@inject(TYPES.FILE_UPLOAD_PATH) private fileUploadPath: string) {}

  async markFilesToBeRemoved(userUuid: string): Promise<Array<RemovedFileDescription>> {
    await promises.rmdir(`${this.fileUploadPath}/${userUuid}`)

    return []
  }

  async remove(filePath: string): Promise<number> {
    const fullPath = `${this.fileUploadPath}/${filePath}`
    const fileSize = (await promises.stat(fullPath)).size

    await promises.rm(fullPath)

    return fileSize
  }
}
