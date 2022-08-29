import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { RevokedSession } from '../../Domain/Session/RevokedSession'
import { RevokedSessionRepositoryInterface } from '../../Domain/Session/RevokedSessionRepositoryInterface'

@injectable()
export class MySQLRevokedSessionRepository implements RevokedSessionRepositoryInterface {
  constructor(
    @inject(TYPES.ORMRevokedSessionRepository)
    private ormRepository: Repository<RevokedSession>,
  ) {}

  async save(revokedSession: RevokedSession): Promise<RevokedSession> {
    return this.ormRepository.save(revokedSession)
  }

  async remove(revokedSession: RevokedSession): Promise<RevokedSession> {
    return this.ormRepository.remove(revokedSession)
  }

  async clearUserAgentByUserUuid(userUuid: string): Promise<void> {
    await this.ormRepository
      .createQueryBuilder('revoked_session')
      .update()
      .set({
        userAgent: null,
      })
      .where('user_uuid = :userUuid', { userUuid })
      .execute()
  }

  async findAllByUserUuid(userUuid: string): Promise<RevokedSession[]> {
    return this.ormRepository
      .createQueryBuilder('revoked_session')
      .where('revoked_session.user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .getMany()
  }

  async findOneByUuid(uuid: string): Promise<RevokedSession | null> {
    return this.ormRepository
      .createQueryBuilder('revoked_session')
      .where('revoked_session.uuid = :uuid', { uuid })
      .getOne()
  }
}
