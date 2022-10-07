import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'

import { WorkspaceUser } from '../../Domain/Workspace/WorkspaceUser'
import { MySQLWorkspaceUserRepository } from './MySQLWorkspaceUserRepository'

describe('MySQLWorkspaceUserRepository', () => {
  let ormRepository: Repository<WorkspaceUser>
  let workspace: WorkspaceUser
  let queryBuilder: SelectQueryBuilder<WorkspaceUser>

  const createRepository = () => new MySQLWorkspaceUserRepository(ormRepository)

  beforeEach(() => {
    workspace = {} as jest.Mocked<WorkspaceUser>

    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<WorkspaceUser>>

    ormRepository = {} as jest.Mocked<Repository<WorkspaceUser>>
    ormRepository.save = jest.fn()
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should save', async () => {
    await createRepository().save(workspace)

    expect(ormRepository.save).toHaveBeenCalledWith(workspace)
  })
})
