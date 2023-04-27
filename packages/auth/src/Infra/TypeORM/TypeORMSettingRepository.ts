import { SettingName } from '@standardnotes/settings'
import { ReadStream } from 'fs'
import { inject, injectable } from 'inversify'
import { Repository } from 'typeorm'
import TYPES from '../../Bootstrap/Types'
import { Setting } from '../../Domain/Setting/Setting'
import { SettingRepositoryInterface } from '../../Domain/Setting/SettingRepositoryInterface'
import { DeleteSettingDto } from '../../Domain/UseCase/DeleteSetting/DeleteSettingDto'

@injectable()
export class TypeORMSettingRepository implements SettingRepositoryInterface {
  constructor(
    @inject(TYPES.ORMSettingRepository)
    private ormRepository: Repository<Setting>,
  ) {}

  async save(setting: Setting): Promise<Setting> {
    return this.ormRepository.save(setting)
  }

  async findOneByUuidAndNames(uuid: string, names: SettingName[]): Promise<Setting | null> {
    const nameValues = names.map((name) => name.value)
    return this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.uuid = :uuid AND setting.name IN (:...names)', {
        names: nameValues,
        uuid,
      })
      .getOne()
  }

  async streamAllByName(name: SettingName): Promise<ReadStream> {
    return this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.name = :name', {
        name: name.value,
      })
      .orderBy('updated_at', 'ASC')
      .stream()
  }

  async streamAllByNameAndValue(name: SettingName, value: string): Promise<ReadStream> {
    return this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.name = :name AND setting.value = :value', {
        name: name.value,
        value,
      })
      .orderBy('updated_at', 'ASC')
      .stream()
  }

  async findOneByUuid(uuid: string): Promise<Setting | null> {
    return this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.uuid = :uuid', {
        uuid,
      })
      .getOne()
  }

  async findOneByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null> {
    return this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.name = :name AND setting.user_uuid = :user_uuid', {
        name,
        user_uuid: userUuid,
      })
      .getOne()
  }

  async findLastByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null> {
    const settings = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.name = :name AND setting.user_uuid = :user_uuid', {
        name,
        user_uuid: userUuid,
      })
      .orderBy('updated_at', 'DESC')
      .limit(1)
      .getMany()

    if (settings.length === 0) {
      return null
    }

    return settings.pop() as Setting
  }

  async findAllByUserUuid(userUuid: string): Promise<Setting[]> {
    return this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .getMany()
  }

  async deleteByUserUuid({ settingName, userUuid }: DeleteSettingDto): Promise<void> {
    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .where('name = :name AND user_uuid = :user_uuid', {
        user_uuid: userUuid,
        name: settingName,
      })
      .execute()
  }
}
