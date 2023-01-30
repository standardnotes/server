import { Readable } from 'stream'
import { createReadStream, promises } from 'fs'
import { inject, injectable } from 'inversify'

import { FileDownloaderInterface } from '../../Domain/Services/FileDownloaderInterface'
import TYPES from '../../Bootstrap/Types'

@injectable()
export class FSFileDownloader implements FileDownloaderInterface {
  constructor(@inject(TYPES.FILE_UPLOAD_PATH) private fileUploadPath: string) {}

  async getFileSize(filePath: string): Promise<number> {
    return (await promises.stat(`${this.fileUploadPath}/${filePath}`)).size
  }

  async createDownloadStream(filePath: string, startRange: number, endRange: number): Promise<Readable> {
    return Promise.resolve(createReadStream(`${this.fileUploadPath}/${filePath}`, { start: startRange, end: endRange }))
  }
}
