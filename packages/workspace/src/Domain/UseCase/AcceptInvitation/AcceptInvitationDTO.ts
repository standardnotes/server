import { Uuid } from '@standardnotes/common'

export type AcceptInvitationDTO = {
  invitationUuid: Uuid
  acceptingUserUuid: Uuid
  publicKey: string
  encryptedPrivateKey: string
}
