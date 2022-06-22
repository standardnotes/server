import { SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { GetSettingDto } from './GetSettingDto'
import { GetSettingResponse } from './GetSettingResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import TYPES from '../../../Bootstrap/Types'
import { SettingProjector } from '../../../Projection/SettingProjector'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'

@injectable()
export class GetSetting implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingProjector) private settingProjector: SettingProjector,
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
  ) {}

  async execute(dto: GetSettingDto): Promise<GetSettingResponse> {
    const { userUuid, settingName } = dto

    const setting = await this.settingService.findSettingWithDecryptedValue({
      userUuid,
      settingName: settingName as SettingName,
    })

    if (setting === null) {
      return {
        success: false,
        error: {
          message: `Setting ${settingName} for user ${userUuid} not found!`,
        },
      }
    }

    if (setting.sensitive && !dto.allowSensitiveRetrieval) {
      return {
        success: true,
        sensitive: true,
      }
    }

    const simpleSetting = await this.settingProjector.projectSimple(setting)

    return {
      success: true,
      userUuid,
      setting: simpleSetting,
    }
  }
}
