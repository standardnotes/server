export interface SendMessageToClientDTO {
  userUuid: string
  message: string
  originatingSessionUuid?: string
}
