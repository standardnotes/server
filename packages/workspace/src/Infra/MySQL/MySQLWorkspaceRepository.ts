import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'
import { Workspace } from '../../Domain/Workspace/Workspace'
import { WorkspaceRepositoryInterface } from '../../Domain/Workspace/WorkspaceRepositoryInterface'

@injectable()
export class MySQLWorkspaceRepository implements WorkspaceRepositoryInterface {
  constructor(
    @inject(TYPES.ORMWorkspaceRepository)
    private ormRepository: Repository<Workspace>,
  ) {}

  async findOneByUuid(uuid: string): Promise<Workspace | null> {
    return this.ormRepository.createQueryBuilder().where('uuid = :uuid', { uuid }).getOne()
  }

  async findByUuids(uuids: string[]): Promise<Workspace[]> {
    return this.ormRepository.createQueryBuilder().where('uuid IN (:...uuids)', { uuids }).getMany()
  }

  async save(workspace: Workspace): Promise<Workspace> {
    return this.ormRepository.save(workspace)
  }
}
