import { Readable } from 'stream'

export interface FileDownloaderInterface {
  createDownloadStream(filePath: string, startRange: number, endRange: number): Readable
  getFileSize(filePath: string): Promise<number>
}
