import { ContentType } from '@standardnotes/common'
import { IntegrityPayload } from '@standardnotes/payloads'

export type ExtendedIntegrityPayload = IntegrityPayload & {
  content_type: ContentType
}
