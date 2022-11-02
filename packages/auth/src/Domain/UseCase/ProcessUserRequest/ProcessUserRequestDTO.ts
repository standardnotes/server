import { UserRequestType, Uuid } from '@standardnotes/common'

export type ProcessUserRequestDTO = {
  userUuid: Uuid
  userEmail: string
  requestType: UserRequestType
}
