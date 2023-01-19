import { IntegrityPayload } from '@standardnotes/payloads'

export type CheckIntegrityDTO = {
  userUuid: string
  integrityPayloads: IntegrityPayload[]
  freeUser: boolean
}
