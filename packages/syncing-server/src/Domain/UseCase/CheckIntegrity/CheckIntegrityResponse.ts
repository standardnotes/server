import { IntegrityPayload } from '@standardnotes/payloads'

export type CheckIntegrityResponse = {
  mismatches: IntegrityPayload[]
}
