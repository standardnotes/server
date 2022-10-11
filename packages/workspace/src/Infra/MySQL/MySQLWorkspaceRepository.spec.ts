import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'

import { Workspace } from '../../Domain/Workspace/Workspace'

import { MySQLWorkspaceRepository } from './MySQLWorkspaceRepository'

describe('MySQLWorkspaceRepository', () => {
  let ormRepository: Repository<Workspace>
  let workspace: Workspace
  let queryBuilder: SelectQueryBuilder<Workspace>

  const createRepository = () => new MySQLWorkspaceRepository(ormRepository)

  beforeEach(() => {
    workspace = {} as jest.Mocked<Workspace>

    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Workspace>>

    ormRepository = {} as jest.Mocked<Repository<Workspace>>
    ormRepository.save = jest.fn()
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should save', async () => {
    await createRepository().save(workspace)

    expect(ormRepository.save).toHaveBeenCalledWith(workspace)
  })

  it('should find many by uuids', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    await createRepository().findByUuids(['i-1-2-3'])

    expect(queryBuilder.where).toHaveBeenCalledWith('uuid IN (:...uuids)', { uuids: ['i-1-2-3'] })
  })

  it('should find one by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(null)

    await createRepository().findOneByUuid('i-1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', { uuid: 'i-1-2-3' })
  })
})
