import { Readable } from 'stream'

export interface FileDownloaderInterface {
  createDownloadStream(filePath: string, startRange: number, endRange: number): Promise<Readable>
  getFileSize(filePath: string): Promise<number>
  listFiles(userUuid: string): Promise<{ name: string; size: number }[]>
}
