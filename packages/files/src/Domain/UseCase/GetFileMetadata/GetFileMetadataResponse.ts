export type GetFileMetadataResponse =
  | {
      success: true
      size: number
    }
  | {
      success: false
      message: string
    }
