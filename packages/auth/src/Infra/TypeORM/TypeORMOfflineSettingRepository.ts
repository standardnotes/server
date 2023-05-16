import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'

import TYPES from '../../Bootstrap/Types'
import { OfflineSetting } from '../../Domain/Setting/OfflineSetting'
import { OfflineSettingName } from '../../Domain/Setting/OfflineSettingName'
import { OfflineSettingRepositoryInterface } from '../../Domain/Setting/OfflineSettingRepositoryInterface'

@injectable()
export class TypeORMOfflineSettingRepository implements OfflineSettingRepositoryInterface {
  constructor(@inject(TYPES.Auth_ORMOfflineSettingRepository) private ormRepository: Repository<OfflineSetting>) {}

  async save(offlineSetting: OfflineSetting): Promise<OfflineSetting> {
    return this.ormRepository.save(offlineSetting)
  }

  async findOneByNameAndValue(name: OfflineSettingName, value: string): Promise<OfflineSetting | null> {
    return this.ormRepository
      .createQueryBuilder('offline_setting')
      .where('offline_setting.name = :name AND offline_setting.value = :value', {
        name,
        value,
      })
      .getOne()
  }

  async findOneByNameAndEmail(name: OfflineSettingName, email: string): Promise<OfflineSetting | null> {
    return this.ormRepository
      .createQueryBuilder('offline_setting')
      .where('offline_setting.name = :name AND offline_setting.email = :email', {
        name,
        email,
      })
      .getOne()
  }
}
