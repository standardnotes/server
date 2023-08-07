import { SessionBody } from '@standardnotes/responses'
import { User } from '../User/User'
import { RevokedSession } from './RevokedSession'
import { Session } from './Session'

export interface SessionServiceInterface {
  createNewSessionForUser(dto: {
    user: User
    apiVersion: string
    userAgent: string
    readonlyAccess: boolean
  }): Promise<{ sessionHttpRepresentation: SessionBody; session: Session }>
  createNewEphemeralSessionForUser(dto: {
    user: User
    apiVersion: string
    userAgent: string
    readonlyAccess: boolean
  }): Promise<{ sessionHttpRepresentation: SessionBody; session: Session }>
  refreshTokens(session: Session): Promise<SessionBody>
  getSessionFromToken(token: string): Promise<Session | undefined>
  getRevokedSessionFromToken(token: string): Promise<RevokedSession | null>
  markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession>
  deleteSessionByToken(token: string): Promise<string | null>
  isRefreshTokenMatchingHashedSessionToken(session: Session, token: string): boolean
  getDeviceInfo(session: Session): string
  getOperatingSystemInfoFromUserAgent(userAgent: string): string
  getBrowserInfoFromUserAgent(userAgent: string): string
  createRevokedSession(session: Session): Promise<RevokedSession>
}
