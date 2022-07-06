import { Uuid } from '@standardnotes/common'

export interface UserSignedInEventPayload {
  userUuid: string
  userEmail: string
  signInAlertEnabled: boolean
  muteSignInEmailsSettingUuid: Uuid
  device: string
  browser?: string
}
