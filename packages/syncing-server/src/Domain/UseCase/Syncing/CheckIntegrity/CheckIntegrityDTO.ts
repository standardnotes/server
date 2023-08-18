import { IntegrityPayload } from '@standardnotes/responses'

export type CheckIntegrityDTO = {
  userUuid: string
  roleNames: string[]
  integrityPayloads: IntegrityPayload[]
}
