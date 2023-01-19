import { IntegrityPayload } from '@standardnotes/responses'

export type CheckIntegrityResponse = {
  mismatches: IntegrityPayload[]
}
