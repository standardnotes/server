import { Readable } from 'stream'

export type StreamDownloadFileResponse =
  | {
      success: true
      readStream: Readable
    }
  | {
      success: false
      message: string
    }
