export type FinishUploadSessionResponse =
  | {
      success: true
    }
  | {
      success: false
      message: string
    }
