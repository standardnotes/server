import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { RevokedSession } from '../../Domain/Session/RevokedSession'
import { RevokedSessionRepositoryInterface } from '../../Domain/Session/RevokedSessionRepositoryInterface'

@injectable()
export class TypeORMRevokedSessionRepository implements RevokedSessionRepositoryInterface {
  constructor(
    @inject(TYPES.Auth_ORMRevokedSessionRepository)
    private ormRepository: Repository<RevokedSession>,
  ) {}

  async findOneByPrivateIdentifier(privateIdentifier: string): Promise<RevokedSession | null> {
    return this.ormRepository
      .createQueryBuilder('revoked_session')
      .where('revoked_session.private_identifier = :privateIdentifier', { privateIdentifier })
      .getOne()
  }

  async insert(revokedSession: RevokedSession): Promise<void> {
    await this.ormRepository.insert(revokedSession)
  }

  async update(revokedSession: RevokedSession): Promise<void> {
    const { uuid, ...revokedSessionProps } = revokedSession

    await this.ormRepository.update({ uuid }, revokedSessionProps)
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
