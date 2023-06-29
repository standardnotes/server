import { inject, injectable } from 'inversify'
import { promises as fsPromises } from 'fs'
import * as path from 'path'

import { FileMoverInterface } from '../../Domain/Services/FileMoverInterface'
import TYPES from '../../Bootstrap/Types'

@injectable()
export class FSFileMover implements FileMoverInterface {
  constructor(@inject(TYPES.Files_FILE_UPLOAD_PATH) private fileUploadPath: string) {}

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = `${this.fileUploadPath}/${sourcePath}`
    const destinationFullPath = `${this.fileUploadPath}/${destinationPath}`

    const destinationDir = path.dirname(destinationFullPath)

    await fsPromises.mkdir(destinationDir, { recursive: true })

    await fsPromises.rename(sourceFullPath, destinationFullPath)
  }
}
