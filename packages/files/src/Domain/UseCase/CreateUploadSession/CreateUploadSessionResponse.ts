import { UploadId } from '../../Upload/UploadId'

export type CreateUploadSessionResponse =
  | {
      success: true
      uploadId: UploadId
    }
  | {
      success: false
      message: string
    }
