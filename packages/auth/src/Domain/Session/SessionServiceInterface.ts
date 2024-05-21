import { User } from '../User/User'
import { RevokedSession } from './RevokedSession'
import { Session } from './Session'
import { SessionCreationResult } from './SessionCreationResult'
import { ApiVersion } from '../Api/ApiVersion'

export interface SessionServiceInterface {
  createNewSessionForUser(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult>
  createNewEphemeralSessionForUser(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult>
  refreshTokens(dto: {
    session: Session
    isEphemeral: boolean
    apiVersion: ApiVersion
    snjs?: string
    application?: string
  }): Promise<SessionCreationResult>
  getRevokedSessionFromToken(token: string): Promise<RevokedSession | null>
  markRevokedSessionAsReceived(revokedSession: RevokedSession): Promise<RevokedSession>
  getDeviceInfo(session: Session): string
  getOperatingSystemInfoFromUserAgent(userAgent: string): string
  getBrowserInfoFromUserAgent(userAgent: string): string
  createRevokedSession(session: Session): Promise<RevokedSession>
}
