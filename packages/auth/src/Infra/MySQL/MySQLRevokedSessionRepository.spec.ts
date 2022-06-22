import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'

import { RevokedSession } from '../../Domain/Session/RevokedSession'

import { MySQLRevokedSessionRepository } from './MySQLRevokedSessionRepository'

describe('MySQLRevokedSessionRepository', () => {
  let ormRepository: Repository<RevokedSession>
  let queryBuilder: SelectQueryBuilder<RevokedSession>
  let session: RevokedSession

  const createRepository = () => new MySQLRevokedSessionRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<RevokedSession>>

    session = {} as jest.Mocked<RevokedSession>

    ormRepository = {} as jest.Mocked<Repository<RevokedSession>>
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

  it('should find one session by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(session)

    const result = await createRepository().findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('revoked_session.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(session)
  })

  it('should find all revoked sessions by user id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([session])

    const result = await createRepository().findAllByUserUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('revoked_session.user_uuid = :user_uuid', { user_uuid: '123' })
    expect(result).toEqual([session])
  })
})
