import { UserRequestType } from '@standardnotes/common'

export type ProcessUserRequestDTO = {
  userUuid: string
  userEmail: string
  requestType: UserRequestType
}
