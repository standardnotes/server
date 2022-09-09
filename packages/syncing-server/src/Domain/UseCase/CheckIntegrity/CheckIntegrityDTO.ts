import { Uuid } from '@standardnotes/common'
import { IntegrityPayload } from '@standardnotes/payloads'

export type CheckIntegrityDTO = {
  userUuid: Uuid
  integrityPayloads: IntegrityPayload[]
  freeUser: boolean
  analyticsId: number
}
