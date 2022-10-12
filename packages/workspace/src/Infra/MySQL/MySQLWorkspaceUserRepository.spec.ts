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

  it('should find many by user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    await createRepository().findByUserUuid('i-1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('user_uuid = :userUuid', { userUuid: 'i-1-2-3' })
  })

  it('should find many by workspace uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([])

    await createRepository().findByWorkspaceUuid('i-1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('workspace_uuid = :workspaceUuid', { workspaceUuid: 'i-1-2-3' })
  })

  it('should find one by workspace uuid and user uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(null)

    await createRepository().findOneByUserUuidAndWorkspaceUuid({ workspaceUuid: 'w-1-2-3', userUuid: 'u-1-2-3' })

    expect(queryBuilder.where).toHaveBeenCalledWith('workspace_uuid = :workspaceUuid AND user_uuid = :userUuid', {
      workspaceUuid: 'w-1-2-3',
      userUuid: 'u-1-2-3',
    })
  })
})
