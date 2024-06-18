import { CacheEntryRepositoryInterface, CacheEntry } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { EphemeralSession } from '../../Domain/Session/EphemeralSession'
import { EphemeralSessionRepositoryInterface } from '../../Domain/Session/EphemeralSessionRepositoryInterface'

export class TypeORMEphemeralSessionRepository implements EphemeralSessionRepositoryInterface {
  private readonly PREFIX = 'session'
  private readonly PREFIX_PRIVATE_ID = 'session-private-id'
  private readonly USER_SESSIONS_PREFIX = 'user-sessions'

  constructor(
    private cacheEntryRepository: CacheEntryRepositoryInterface,
    private ephemeralSessionAge: number,
    private timer: TimerInterface,
  ) {}

  async findOneByPrivateIdentifier(privateIdentifier: string): Promise<EphemeralSession | null> {
    const stringifiedSession = await this.cacheEntryRepository.findUnexpiredOneByKey(
      `${this.PREFIX_PRIVATE_ID}:${privateIdentifier}`,
    )
    if (!stringifiedSession) {
      return null
    }

    return JSON.parse(stringifiedSession.props.value)
  }

  async deleteOne(uuid: string, userUuid: string): Promise<void> {
    await this.cacheEntryRepository.removeByKey(`${this.PREFIX}:${uuid}`)
    await this.cacheEntryRepository.removeByKey(`${this.PREFIX}:${uuid}:${userUuid}`)

    const userSessionsJSON = await this.cacheEntryRepository.findUnexpiredOneByKey(
      `${this.USER_SESSIONS_PREFIX}:${userUuid}`,
    )
    if (userSessionsJSON) {
      const userSessions = JSON.parse(userSessionsJSON.props.value)
      const updatedUserSessions = userSessions.filter((sessionUuid: string) => sessionUuid !== uuid)
      userSessionsJSON.props.value = JSON.stringify(updatedUserSessions)
      await this.cacheEntryRepository.save(userSessionsJSON)
    }
  }

  async findAllByUserUuid(userUuid: string): Promise<Array<EphemeralSession>> {
    const ephemeralSessionUuidsJSON = await this.cacheEntryRepository.findUnexpiredOneByKey(
      `${this.USER_SESSIONS_PREFIX}:${userUuid}`,
    )
    if (!ephemeralSessionUuidsJSON) {
      return []
    }
    const ephemeralSessionUuids = JSON.parse(ephemeralSessionUuidsJSON.props.value)

    const sessions = []
    for (const ephemeralSessionUuid of ephemeralSessionUuids) {
      const stringifiedSession = await this.cacheEntryRepository.findUnexpiredOneByKey(
        `${this.PREFIX}:${ephemeralSessionUuid}`,
      )
      if (stringifiedSession !== null) {
        sessions.push(JSON.parse(stringifiedSession.props.value))
      }
    }

    return sessions
  }

  async findOneByUuid(uuid: string): Promise<EphemeralSession | null> {
    const stringifiedSession = await this.cacheEntryRepository.findUnexpiredOneByKey(`${this.PREFIX}:${uuid}`)
    if (!stringifiedSession) {
      return null
    }

    return JSON.parse(stringifiedSession.props.value)
  }

  async findOneByUuidAndUserUuid(uuid: string, userUuid: string): Promise<EphemeralSession | null> {
    const stringifiedSession = await this.cacheEntryRepository.findUnexpiredOneByKey(
      `${this.PREFIX}:${uuid}:${userUuid}`,
    )
    if (!stringifiedSession) {
      return null
    }

    return JSON.parse(stringifiedSession.props.value)
  }

  async update(ephemeralSession: EphemeralSession): Promise<void> {
    return this.insert(ephemeralSession)
  }

  async insert(ephemeralSession: EphemeralSession): Promise<void> {
    const ttl = this.ephemeralSessionAge

    ephemeralSession.updatedAt = this.timer.getUTCDate()

    const stringifiedSession = JSON.stringify(ephemeralSession)

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key: `${this.PREFIX}:${ephemeralSession.uuid}:${ephemeralSession.userUuid}`,
        value: stringifiedSession,
        expiresAt: this.timer.getUTCDateNSecondsAhead(ttl),
      }).getValue(),
    )

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key: `${this.PREFIX}:${ephemeralSession.uuid}`,
        value: stringifiedSession,
        expiresAt: this.timer.getUTCDateNSecondsAhead(ttl),
      }).getValue(),
    )

    await this.cacheEntryRepository.save(
      CacheEntry.create({
        key: `${this.PREFIX_PRIVATE_ID}:${ephemeralSession.privateIdentifier}`,
        value: stringifiedSession,
        expiresAt: this.timer.getUTCDateNSecondsAhead(ttl),
      }).getValue(),
    )

    const ephemeralSessionUuidsJSON = await this.cacheEntryRepository.findUnexpiredOneByKey(
      `${this.USER_SESSIONS_PREFIX}:${ephemeralSession.userUuid}`,
    )
    if (!ephemeralSessionUuidsJSON) {
      await this.cacheEntryRepository.save(
        CacheEntry.create({
          key: `${this.USER_SESSIONS_PREFIX}:${ephemeralSession.userUuid}`,
          value: JSON.stringify([ephemeralSession.uuid]),
          expiresAt: this.timer.getUTCDateNSecondsAhead(ttl),
        }).getValue(),
      )
    } else {
      const ephemeralSessionUuids = JSON.parse(ephemeralSessionUuidsJSON.props.value)
      ephemeralSessionUuids.push(ephemeralSession.uuid)
      ephemeralSessionUuidsJSON.props.value = JSON.stringify(ephemeralSessionUuids)
      ephemeralSessionUuidsJSON.props.expiresAt = this.timer.getUTCDateNSecondsAhead(ttl)
      await this.cacheEntryRepository.save(ephemeralSessionUuidsJSON)
    }
  }
}
