import { ContentType } from '@standardnotes/common'

export type SimpleRevisionProjection = {
  uuid: string
  content_type: ContentType | null
  required_role: string
  created_at: string
  updated_at: string
}
