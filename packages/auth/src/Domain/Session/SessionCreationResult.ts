import { SessionBody } from '@standardnotes/responses'

import { Session } from './Session'

export interface SessionCreationResult {
  sessionHttpRepresentation: SessionBody
  sessionCookieRepresentation: {
    accessToken: string
    refreshToken: string
  }
  session: Session
}
