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
    const settingNameOrError = SettingName.create(dto.settingName)
    if (settingNameOrError.isFailed()) {
      return {
        success: false,
        error: {
          message: settingNameOrError.getError(),
        },
      }
    }
    const settingName = settingNameOrError.getValue()

    const setting = await this.settingService.findSettingWithDecryptedValue({
      userUuid: dto.userUuid,
      settingName,
    })

    if (setting === null) {
      return {
        success: false,
        error: {
          message: `Setting ${settingName.value} for user ${dto.userUuid} not found!`,
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
      userUuid: dto.userUuid,
      setting: simpleSetting,
    }
  }
}
