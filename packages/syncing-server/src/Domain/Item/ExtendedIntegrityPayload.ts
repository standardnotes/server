import { ContentType } from '@standardnotes/common'
import { IntegrityPayload } from '@standardnotes/responses'

export type ExtendedIntegrityPayload = IntegrityPayload & {
  content_type: ContentType
}
