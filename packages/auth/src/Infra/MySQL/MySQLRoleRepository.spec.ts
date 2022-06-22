import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'
import { Role } from '../../Domain/Role/Role'

import { MySQLRoleRepository } from './MySQLRoleRepository'

describe('MySQLRoleRepository', () => {
  let ormRepository: Repository<Role>
  let queryBuilder: SelectQueryBuilder<Role>
  let role: Role

  const createRepository = () => new MySQLRoleRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Role>>
    queryBuilder.cache = jest.fn().mockReturnThis()

    role = {} as jest.Mocked<Role>

    ormRepository = {} as jest.Mocked<Repository<Role>>
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should find latest version of a role by name', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.take = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([role])

    const result = await createRepository().findOneByName('test')

    expect(queryBuilder.where).toHaveBeenCalledWith('role.name = :name', { name: 'test' })
    expect(queryBuilder.take).toHaveBeenCalledWith(1)
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('version', 'DESC')
    expect(result).toEqual(role)
  })

  it('should return null if not found the latest version of a role by name', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.take = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    const result = await createRepository().findOneByName('test')

    expect(result).toBeNull()
  })
})
