import { promises } from 'fs'

import { FileRemoverInterface } from '../../Domain/Services/FileRemoverInterface'
import { RemovedFileDescription } from '../../Domain/File/RemovedFileDescription'

export class FSFileRemover implements FileRemoverInterface {
  constructor(private fileUploadPath: string) {}

  async markFilesToBeRemoved(userOrSharedVaultUuid: string): Promise<Array<RemovedFileDescription>> {
    const removedFileDescriptions: RemovedFileDescription[] = []

    const files = await promises.readdir(`${this.fileUploadPath}/${userOrSharedVaultUuid}`, { withFileTypes: true })

    for (const file of files) {
      const filePath = `${this.fileUploadPath}/${userOrSharedVaultUuid}/${file.name}`

      const fileByteSize = await this.remove(`${userOrSharedVaultUuid}/${file.name}`)

      removedFileDescriptions.push({
        filePath,
        fileByteSize,
        userOrSharedVaultUuid,
        fileName: file.name,
      })
    }

    return removedFileDescriptions
  }

  async remove(filePath: string): Promise<number> {
    const fullPath = `${this.fileUploadPath}/${filePath}`
    const fileSize = (await promises.stat(fullPath)).size

    await promises.rm(fullPath)

    return fileSize
  }
}
