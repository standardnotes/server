export type RemoveFileResponse =
  | {
      success: true
    }
  | {
      success: false
      message: string
    }
