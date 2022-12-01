import { MapperInterface, SettingName, Uuid } from '@standardnotes/domain-core'
import { Repository } from 'typeorm'
import { Setting } from '../../Domain/Setting/Setting'

import { SettingRepositoryInterface } from '../../Domain/Setting/SettingRepositoryInterface'
import { TypeORMSetting } from '../TypeORM/TypeORMSetting'

export class MySQLSettingRepository implements SettingRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSetting>,
    private settingMapper: MapperInterface<Setting, TypeORMSetting>,
  ) {}

  async findOneByNameAndValue(name: SettingName, value: string): Promise<Setting | null> {
    const typeormSetting = await this.ormRepository
      .createQueryBuilder()
      .where('name = :name', { name: name.value })
      .andWhere('value = :value', { value })
      .getOne()

    if (typeormSetting === null) {
      return null
    }

    return this.settingMapper.toDomain(typeormSetting)
  }

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
