export type UploadFileChunkResponse =
  | {
      success: true
    }
  | {
      success: false
      message: string
    }
