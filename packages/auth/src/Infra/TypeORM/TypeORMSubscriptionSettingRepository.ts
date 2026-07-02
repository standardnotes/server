import { Repository } from 'typeorm'
import { MapperInterface, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

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

  async incrementCounterValueForNameAndUserSubscriptionUuid(
    name: string,
    userSubscriptionUuid: Uuid,
    delta: number,
    updatedAt: number,
  ): Promise<void> {
    // Atomic upsert: relies on the unique index on (name, user_subscription_uuid) so that
    // concurrent updates for the same subscription cannot create duplicate rows or lose an
    // increment. The value is stored as text but treated as a signed integer counter, clamped
    // to a minimum of 0. `created_at` is only set when a new row is inserted.
    const uuid = new UniqueEntityId().toString()
    const isSQLite = this.ormRepository.manager.connection.options.type === 'sqlite'

    const query = isSQLite
      ? 'INSERT INTO "subscription_settings" ' +
        '("uuid", "name", "value", "server_encryption_version", "created_at", "updated_at", "sensitive", "user_subscription_uuid") ' +
        'VALUES (?, ?, MAX(?, 0), 0, ?, ?, 0, ?) ' +
        'ON CONFLICT ("name", "user_subscription_uuid") DO UPDATE SET ' +
        "value = MAX(CAST(COALESCE(value, '0') AS INTEGER) + ?, 0), updated_at = ?"
      : 'INSERT INTO `subscription_settings` ' +
        '(`uuid`, `name`, `value`, `server_encryption_version`, `created_at`, `updated_at`, `sensitive`, `user_subscription_uuid`) ' +
        'VALUES (?, ?, GREATEST(?, 0), 0, ?, ?, 0, ?) ' +
        'ON DUPLICATE KEY UPDATE ' +
        "value = GREATEST(CAST(COALESCE(value, '0') AS SIGNED) + ?, 0), updated_at = ?"

    await this.ormRepository.manager.query(query, [
      uuid,
      name,
      delta,
      updatedAt,
      updatedAt,
      userSubscriptionUuid.value,
      delta,
      updatedAt,
    ])
  }
}
