import { Repository } from 'typeorm'
import { MapperInterface, NotificationType, Uuid } from '@standardnotes/domain-core'

import { NotificationRepositoryInterface } from '../../Domain/Notifications/NotificationRepositoryInterface'
import { TypeORMNotification } from './TypeORMNotification'
import { Notification } from '../../Domain/Notifications/Notification'

export class TypeORMNotificationRepository implements NotificationRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMNotification>,
    private mapper: MapperInterface<Notification, TypeORMNotification>,
  ) {}

  async findByUserUuidAndType(userUuid: Uuid, type: NotificationType): Promise<Notification[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('notification')
      .where('notification.user_uuid = :userUuid', {
        userUuid: userUuid.value,
      })
      .andWhere('notification.type = :type', {
        type: type.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async remove(notification: Notification): Promise<void> {
    await this.ormRepository.remove(this.mapper.toProjection(notification))
  }

  async save(sharedVault: Notification): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVault)

    await this.ormRepository.save(persistence)
  }

  async findByUserUuidUpdatedAfter(uuid: Uuid, updatedAtTimestamp: number): Promise<Notification[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('notification')
      .where('notification.user_uuid = :userUuid', {
        userUuid: uuid.value,
      })
      .andWhere('notification.updated_at_timestamp > :updatedAtTimestamp', {
        updatedAtTimestamp,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async findByUserUuid(uuid: Uuid): Promise<Notification[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('notification')
      .where('notification.user_uuid = :userUuid', {
        userUuid: uuid.value,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }
}
