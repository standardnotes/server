import { Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'

import { SettingRepositoryInterface } from '../../Domain/Setting/SettingRepositoryInterface'
import { TypeORMSetting } from '../TypeORM/TypeORMSetting'

export class MySQLSettingRepository implements SettingRepositoryInterface {
  constructor(private ormRepository: Repository<TypeORMSetting>) {}

  async setValueOnMultipleSettings(settingNames: string[], userUuid: Uuid, value: string | null): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .update()
      .set({
        value,
      })
      .where('user_uuid = :userUuid', { userUuid: userUuid.value })
      .andWhere('name IN (:...settingNames)', { settingNames })
      .execute()
  }
}
