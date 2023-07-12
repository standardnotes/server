import { IntegrityPayload } from '@standardnotes/responses'

export type ExtendedIntegrityPayload = IntegrityPayload & {
  content_type: string | null
}
