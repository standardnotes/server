export type MoveFileResponse =
  | {
      success: true
    }
  | {
      success: false
      message: string
    }
