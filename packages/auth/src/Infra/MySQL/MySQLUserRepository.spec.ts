import 'reflect-metadata'

import { ReadStream } from 'fs'

import { Repository, SelectQueryBuilder } from 'typeorm'
import { User } from '../../Domain/User/User'

import { MySQLUserRepository } from './MySQLUserRepository'

describe('MySQLUserRepository', () => {
  let ormRepository: Repository<User>
  let queryBuilder: SelectQueryBuilder<User>
  let user: User

  const createRepository = () => new MySQLUserRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<User>>
    queryBuilder.cache = jest.fn().mockReturnThis()

    user = {} as jest.Mocked<User>

    ormRepository = {} as jest.Mocked<Repository<User>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
    ormRepository.save = jest.fn()
    ormRepository.remove = jest.fn()
  })

  it('should save', async () => {
    await createRepository().save(user)

    expect(ormRepository.save).toHaveBeenCalledWith(user)
  })

  it('should remove', async () => {
    await createRepository().remove(user)

    expect(ormRepository.remove).toHaveBeenCalledWith(user)
  })

  it('should find one user by id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(user)

    const result = await createRepository().findOneByUuid('123')

    expect(queryBuilder.where).toHaveBeenCalledWith('user.uuid = :uuid', { uuid: '123' })
    expect(result).toEqual(user)
  })

  it('should stream all users', async () => {
    const stream = {} as jest.Mocked<ReadStream>
    queryBuilder.stream = jest.fn().mockReturnValue(stream)

    const result = await createRepository().streamAll()

    expect(result).toEqual(stream)
  })

  it('should find one user by email', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(user)

    const result = await createRepository().findOneByEmail('test@test.te')

    expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email: 'test@test.te' })
    expect(result).toEqual(user)
  })
})
