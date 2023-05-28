import { inject, injectable } from 'inversify'
import { promises } from 'fs'

import { FileMoverInterface } from '../../Domain/Services/FileMoverInterface'
import TYPES from '../../Bootstrap/Types'

@injectable()
export class FSFileMover implements FileMoverInterface {
  constructor(@inject(TYPES.FILE_UPLOAD_PATH) private fileUploadPath: string) {}

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = `${this.fileUploadPath}/${sourcePath}`
    const destinationFullPath = `${this.fileUploadPath}/${destinationPath}`

    await promises.rename(sourceFullPath, destinationFullPath)
  }
}
