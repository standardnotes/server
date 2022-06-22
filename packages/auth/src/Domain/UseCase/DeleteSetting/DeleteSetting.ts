import { inject, injectable } from 'inversify'
import { DeleteSettingDto } from './DeleteSettingDto'
import { DeleteSettingResponse } from './DeleteSettingResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { TimerInterface } from '@standardnotes/time'
import { Setting } from '../../Setting/Setting'

@injectable()
export class DeleteSetting implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: DeleteSettingDto): Promise<DeleteSettingResponse> {
    const { userUuid, settingName } = dto

    const setting = await this.getSetting(dto)

    if (setting === null) {
      return {
        success: false,
        error: {
          message: `Setting ${settingName} for user ${userUuid} not found.`,
        },
      }
    }

    if (dto.softDelete) {
      setting.value = null
      setting.updatedAt = dto.timestamp ?? this.timer.getTimestampInMicroseconds()

      await this.settingRepository.save(setting)
    } else {
      await this.settingRepository.deleteByUserUuid({
        userUuid,
        settingName,
      })
    }

    return {
      success: true,
      settingName,
      userUuid,
    }
  }

  private async getSetting(dto: DeleteSettingDto): Promise<Setting | null> {
    if (dto.uuid !== undefined) {
      return this.settingRepository.findOneByUuid(dto.uuid)
    }

    return this.settingRepository.findLastByNameAndUserUuid(dto.settingName, dto.userUuid)
  }
}
