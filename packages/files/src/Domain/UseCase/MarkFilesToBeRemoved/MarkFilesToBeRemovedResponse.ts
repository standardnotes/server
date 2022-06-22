import { RemovedFileDescription } from '../../File/RemovedFileDescription'

export type MarkFilesToBeRemovedResponse =
  | {
      success: true
      filesRemoved: Array<RemovedFileDescription>
    }
  | {
      success: false
      message: string
    }
