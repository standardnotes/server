import { Repository } from 'typeorm'

import { Setting } from '../../Domain/Setting/Setting'
import { SettingRepositoryInterface } from '../../Domain/Setting/SettingRepositoryInterface'
import { DeleteSettingDto } from '../../Domain/UseCase/DeleteSetting/DeleteSettingDto'
import { TypeORMSetting } from './TypeORMSetting'
import { MapperInterface, SettingName } from '@standardnotes/domain-core'

export class TypeORMSettingRepository implements SettingRepositoryInterface {
  constructor(
    private ormRepository: Repository<TypeORMSetting>,
    private mapper: MapperInterface<Setting, TypeORMSetting>,
  ) {}

  async countAllByNameAndValue(dto: { name: SettingName; value: string }): Promise<number> {
    return this.ormRepository
      .createQueryBuilder()
      .where('name = :name AND value = :value', {
        name: dto.name.value,
        value: dto.value,
      })
      .getCount()
  }

  async findAllByNameAndValue(dto: {
    name: SettingName
    value: string
    offset: number
    limit: number
  }): Promise<Setting[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder()
      .where('name = :name AND value = :value', {
        name: dto.name.value,
        value: dto.value,
      })
      .orderBy('created_at', 'ASC')
      .take(dto.limit)
      .skip(dto.offset)
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
  }

  async insert(setting: Setting): Promise<void> {
    const persistence = this.mapper.toProjection(setting)

    await this.ormRepository.insert(persistence)
  }

  async update(setting: Setting): Promise<void> {
    const persistence = this.mapper.toProjection(setting)

    await this.ormRepository.update(persistence.uuid, persistence)
  }

  async findOneByUuidAndNames(uuid: string, names: SettingName[]): Promise<Setting | null> {
    const nameValues = names.map((name) => name.value)
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.uuid = :uuid AND setting.name IN (:...names)', {
        names: nameValues,
        uuid,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async findOneByUuid(uuid: string): Promise<Setting | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.uuid = :uuid', {
        uuid,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
  }

  async findOneByNameAndUserUuid(name: string, userUuid: string): Promise<Setting | null> {
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.name = :name AND setting.user_uuid = :user_uuid', {
        name,
        user_uuid: userUuid,
      })
      .getOne()

    if (persistence === null) {
      return null
    }

    return this.mapper.toDomain(persistence)
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

    return this.mapper.toDomain(settings.pop() as TypeORMSetting)
  }

  async findAllByUserUuid(userUuid: string): Promise<Setting[]> {
    const persistence = await this.ormRepository
      .createQueryBuilder('setting')
      .where('setting.user_uuid = :user_uuid', {
        user_uuid: userUuid,
      })
      .getMany()

    return persistence.map((p) => this.mapper.toDomain(p))
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
