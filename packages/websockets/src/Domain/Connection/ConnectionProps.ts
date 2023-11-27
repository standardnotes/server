import { Timestamps, Uuid } from '@standardnotes/domain-core'

export interface ConnectionProps {
  userUuid: Uuid
  sessionUuid: Uuid
  connectionId: string
  timestamps: Timestamps
}
