import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import TYPES from '../Bootstrap/Types'

import { Session } from '../Domain/Session/Session'
import { SessionServiceInterface } from '../Domain/Session/SessionServiceInterface'
import { ProjectorInterface } from './ProjectorInterface'

@injectable()
export class SessionProjector implements ProjectorInterface<Session> {
  static readonly CURRENT_SESSION_PROJECTION = 'CURRENT_SESSION_PROJECTION'

  constructor(
    @inject(TYPES.SessionService) private sessionService: SessionServiceInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  projectSimple(session: Session): Record<string, unknown> {
    return {
      uuid: session.uuid,
      api_version: session.apiVersion,
      created_at: this.timer.convertDateToISOString(session.createdAt),
      updated_at: this.timer.convertDateToISOString(session.updatedAt),
      device_info: this.sessionService.getDeviceInfo(session),
      readonly_access: session.readonlyAccess,
      access_expiration: this.timer.convertDateToISOString(session.accessExpiration),
      refresh_expiration: this.timer.convertDateToISOString(session.refreshExpiration),
    }
  }

  projectCustom(projectionType: string, session: Session, currentSession: Session): Record<string, unknown> {
    switch (projectionType) {
      case SessionProjector.CURRENT_SESSION_PROJECTION.toString():
        return {
          uuid: session.uuid,
          api_version: session.apiVersion,
          created_at: this.timer.convertDateToISOString(session.createdAt),
          updated_at: this.timer.convertDateToISOString(session.updatedAt),
          device_info: this.sessionService.getDeviceInfo(session),
          current: session.uuid === currentSession.uuid,
          readonly_access: session.readonlyAccess,
        }
      default:
        throw new Error(`Not supported projection type: ${projectionType}`)
    }
  }

  projectFull(_session: Session): Record<string, unknown> {
    throw Error('not implemented')
  }
}
