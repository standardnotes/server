import { Uuid } from '@standardnotes/common'

export type RemovedFileDescription = {
  userUuid: Uuid
  filePath: string
  fileName: string
  fileByteSize: number
}
