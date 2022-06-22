import 'reflect-metadata'

import * as dayjs from 'dayjs'

import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm'
import { Session } from '../../Domain/Session/Session'

import { MySQLSessionRepository } from './MySQLSessionRepository'

describe('MySQLSessionRepository', () => {
  let ormRepository: Repository<Session>
  let queryBuilder: SelectQueryBuilder<Session>
  let updateQueryBuilder: UpdateQueryBuilder<Session>
  let session: Session

  const createRepository = () => new MySQLSessionRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Session>>
    updateQueryBuilder = {} as jest.Mocked<UpdateQueryBuilder<Session>>

    session = {} as jest.Mocked<Session>

    ormRepository = {} as jest.Mocked<Repository<Session>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
    ormRepository.remove = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(session)

    expect(ormRepository.save).toHaveBeenCalledWith(session)
  })

  it('should remove', async () => {
    await createRepository().remove(session)

    expect(ormRepository.remove).toHaveBeenCalledWith(session)
  })

  it('should clear user agent data on all user sessions', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await createRepository().clearUserAgentByUserUuid('1-2-3')

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith({
      userAgent: null,
    })
    expect(updateQueryBuilder.where).toHaveBeenCalledWith('user_uuid = :userUuid', { userUuid: '1-2-3' })
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should update hashed tokens on a session', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await createRepository().updateHashedTokens('123', '234', '345')

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith({
      hashedAccessToken: '234',
      hashedRefreshToken: '345',
    })
    expect(updateQueryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', { uuid: '123' })
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should update token expiration dates on a session', async () => {
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => updateQueryBuilder)

    updateQueryBuilder.update = jest.fn().mockReturnThis()
    updateQueryBuilder.set = jest.fn().mockReturnThis()
    updateQueryBuilder.where = jest.fn().mockReturnThis()
    updateQueryBuilder.execute = jest.fn()

    await createRepository().updatedTokenExpirationDates(
      '123',
      dayjs.utc('2020-11-26 13:34').toDate(),
      dayjs.utc('2020-11-26 14:34').toDate(),
    )

    expect(updateQueryBuilder.update).toHaveBeenCalled()
    expect(updateQueryBuilder.set).toHaveBeenCalledWith({
      accessExpiration: dayjs.utc('2020-11-26T13:34:00.000Z').toDate(),
      refreshExpiration: dayjs.utc('2020-11-26T14:34:00.000Z').toDate(),
    })
    expect(updateQueryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', { uuid: '123' })
    expect(updateQueryBuilder.execute).toHaveBeenCalled()
  })

  it('should find active sessions by user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([session])

    const result = await createRepository().findAllByRefreshExpirationAndUserUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'session.refresh_expiration > :refresh_expiration AND session.user_uuid = :user_uuid',
      { refresh_expiration: expect.any(Date), user_uuid: '123' },
    )
    expect(result).toEqual([session])
  })

  it('should find all sessions by user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([session])

    const result = await createRepository().findAllByUserUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('session.user_uuid = :user_uuid', { user_uuid: '123' })
    expect(result).toEqual([session])
  })

  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await createRepository().findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })

  it('should find one session by id and user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await createRepository().findOneByUuidAndUserUuid('123', '234')

    expect(queryBuilder.where).toHaveBeenCalledWith('session.uuid = :uuid AND session.user_uuid = :user_uuid', {
      uuid: '123',
      user_uuid: '234',
    })
    expect(result).toEqual(session)
  })

  it('should delete all session for a user except the current one', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await createRepository().deleteAllByUserUuid('123', '234')

    expect(queryBuilder.delete).toHaveBeenCalled()
    expect(queryBuilder.where).toHaveBeenCalledWith('user_uuid = :user_uuid AND uuid != :current_session_uuid', {
      user_uuid: '123',
      current_session_uuid: '234',
    })
    expect(queryBuilder.execute).toHaveBeenCalled()
  })

  it('should delete one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await createRepository().deleteOneByUuid('123')

    expect(queryBuilder.delete).toHaveBeenCalled()
    expect(queryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', { uuid: '123' })
    expect(queryBuilder.execute).toHaveBeenCalled()
  })
})
