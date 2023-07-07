import { Repository } from 'typeorm'
import { MapperInterface } from '@standardnotes/domain-core'

import { NotificationRepositoryInterface } from '../../Domain/Notifications/NotificationRepositoryInterface'
import { TypeORMNotification } from './TypeORMNotification'
import { Notification } from '../../Domain/Notifications/Notification'

export class TypeORMNotificationRepository implements NotificationRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMNotification>,
    private mapper: MapperInterface<Notification, TypeORMNotification>,
  ) {}

  async save(sharedVault: Notification): Promise<void> {
    const persistence = this.mapper.toProjection(sharedVault)

    await this.ormRepository.save(persistence)
  }
}
