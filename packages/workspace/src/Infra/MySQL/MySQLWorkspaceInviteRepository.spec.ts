import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'

import { WorkspaceInvite } from '../../Domain/Invite/WorkspaceInvite'
import { MySQLWorkspaceInviteRepository } from './MySQLWorkspaceInviteRepository'

describe('MySQLWorkspaceInviteRepository', () => {
  let ormRepository: Repository<WorkspaceInvite>
  let invite: WorkspaceInvite
  let queryBuilder: SelectQueryBuilder<WorkspaceInvite>

  const createRepository = () => new MySQLWorkspaceInviteRepository(ormRepository)

  beforeEach(() => {
    invite = {} as jest.Mocked<WorkspaceInvite>

    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<WorkspaceInvite>>

    ormRepository = {} as jest.Mocked<Repository<WorkspaceInvite>>
    ormRepository.save = jest.fn()
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should save', async () => {
    await createRepository().save(invite)

    expect(ormRepository.save).toHaveBeenCalledWith(invite)
  })

  it('should find one by uuid', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(null)

    await createRepository().findOneByUuid('i-1-2-3')

    expect(queryBuilder.where).toHaveBeenCalledWith('uuid = :uuid', { uuid: 'i-1-2-3' })
  })
})
