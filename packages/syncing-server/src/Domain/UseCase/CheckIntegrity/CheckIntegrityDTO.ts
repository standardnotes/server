import { IntegrityPayload } from '@standardnotes/responses'

export type CheckIntegrityDTO = {
  userUuid: string
  integrityPayloads: IntegrityPayload[]
  freeUser: boolean
}
