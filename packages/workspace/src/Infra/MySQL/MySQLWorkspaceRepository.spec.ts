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
})
