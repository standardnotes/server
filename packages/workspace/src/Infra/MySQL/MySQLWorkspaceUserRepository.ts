import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { WorkspaceUser } from '../../Domain/Workspace/WorkspaceUser'
import { WorkspaceUserRepositoryInterface } from '../../Domain/Workspace/WorkspaceUserRepositoryInterface'

@injectable()
export class MySQLWorkspaceUserRepository implements WorkspaceUserRepositoryInterface {
  constructor(
    @inject(TYPES.ORMWorkspaceUserRepository)
    private ormRepository: Repository<WorkspaceUser>,
  ) {}

  async findByWorkspaceUuid(workspaceUuid: string): Promise<WorkspaceUser[]> {
    return this.ormRepository.createQueryBuilder().where('workspace_uuid = :workspaceUuid', { workspaceUuid }).getMany()
  }

  async findByUserUuid(userUuid: string): Promise<WorkspaceUser[]> {
    return this.ormRepository.createQueryBuilder().where('user_uuid = :userUuid', { userUuid }).getMany()
  }

  async save(workspaceUser: WorkspaceUser): Promise<WorkspaceUser> {
    return this.ormRepository.save(workspaceUser)
  }
}
