import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { WorkspaceInvite } from '../../Domain/Invite/WorkspaceInvite'
import { WorkspaceInviteRepositoryInterface } from '../../Domain/Invite/WorkspaceInviteRepositoryInterface'

@injectable()
export class MySQLWorkspaceInviteRepository implements WorkspaceInviteRepositoryInterface {
  constructor(
    @inject(TYPES.ORMWorkspaceInviteRepository)
    private ormRepository: Repository<WorkspaceInvite>,
  ) {}

  async findOneByUuid(uuid: string): Promise<WorkspaceInvite | null> {
    return this.ormRepository.createQueryBuilder().where('uuid = :uuid', { uuid }).getOne()
  }

  async save(workspaceInvite: WorkspaceInvite): Promise<WorkspaceInvite> {
    return this.ormRepository.save(workspaceInvite)
  }
}
