import { ContentType, RoleName } from '@standardnotes/common'

export type SimpleRevisionProjection = {
  uuid: string
  content_type: ContentType | null
  required_role: RoleName
  created_at: string
  updated_at: string
}
