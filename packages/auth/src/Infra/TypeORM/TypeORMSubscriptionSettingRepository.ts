import { Repository } from 'typeorm'
import { MapperInterface, Uuid } from '@standardnotes/domain-core'

import { SubscriptionSettingRepositoryInterface } from '../../Domain/Setting/SubscriptionSettingRepositoryInterface'
import { SubscriptionSetting } from '../../Domain/Setting/SubscriptionSetting'

import { TypeORMSubscriptionSetting } from './TypeORMSubscriptionSetting'

export class TypeORMSubscriptionSettingRepository implements SubscriptionSettingRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSubscriptionSetting>,
    private mapper: MapperInterface<SubscriptionSetting, TypeORMSubscriptionSetting>,
  ) {}

  async findAllBySubscriptionUuid(userSubscriptionUuid: Uuid): Promise<SubscriptionSetting[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.user_subscription_uuid = :userSubscriptionUuid', {
        userSubscriptionUuid: userSubscriptionUuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async insert(subscriptionSetting: SubscriptionSetting): Promise<void> {
    const persistence = this.mapper.toProjection(subscriptionSetting)

    await this.ormRepository.insert(persistence)
  }

  async update(subscriptionSetting: SubscriptionSetting): Promise<void> {
    const persistence = this.mapper.toProjection(subscriptionSetting)

    await this.ormRepository.update(persistence.uuid, persistence)
  }

  async findOneByUuid(uuid: Uuid): Promise<SubscriptionSetting | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.uuid = :uuid', {
        uuid: uuid.value,
      })
      .getOne()

    if (!persistence) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async findLastByNameAndUserSubscriptionUuid(
    name: string,
    userSubscriptionUuid: Uuid,
  ): Promise<SubscriptionSetting | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.name = :name AND setting.user_subscription_uuid = :userSubscriptionUuid', {
        name,
        userSubscriptionUuid: userSubscriptionUuid.value,
      })
      .orderBy('updated_at', 'DESC')
      .getOne()

    if (!persistence) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }
}
