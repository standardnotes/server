import { inject, injectable } from 'inversify'
import { SettingName, Timestamps } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { DeleteSettingDto } from './DeleteSettingDto'
import { DeleteSettingResponse } from './DeleteSettingResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { Setting } from '../../Setting/Setting'
import { VerifyUserServerPassword } from '../VerifyUserServerPassword/VerifyUserServerPassword'

@injectable()
export class DeleteSetting implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.Auth_VerifyUserServerPassword) private verifyUserServerPassword: VerifyUserServerPassword,
    @inject(TYPES.Auth_Timer) private timer: TimerInterface,
  ) {}

  async execute(dto: DeleteSettingDto): Promise<DeleteSettingResponse> {
    const { userUuid, settingName, serverPassword, shouldVerifyUserServerPassword } = dto

    const setting = await this.getSetting(dto)

    if (setting === null) {
      return {
        success: false,
        error: {
          message: `Setting ${settingName} for user ${userUuid} not found.`,
        },
      }
    }

    if (shouldVerifyUserServerPassword && [SettingName.NAMES.MfaSecret].includes(setting.props.name)) {
      const verifyUserServerPasswordResult = await this.verifyUserServerPassword.execute({
        userUuid,
        serverPassword,
        authTokenVersion: dto.authTokenVersion,
      })

      if (verifyUserServerPasswordResult.isFailed()) {
        return {
          success: false,
          error: {
            message: verifyUserServerPasswordResult.getError(),
          },
        }
      }
    }

    if (dto.softDelete) {
      setting.props.value = null
      setting.props.timestamps = Timestamps.create(
        setting.props.timestamps.createdAt,
        dto.timestamp ?? this.timer.getTimestampInMicroseconds(),
      ).getValue()

      await this.settingRepository.update(setting)
    } else {
      await this.settingRepository.deleteByUserUuid({
        userUuid,
        settingName,
      })
    }

    if (settingName === SettingName.NAMES.MfaSecret) {
      await this.settingRepository.deleteByUserUuid({
        userUuid: dto.userUuid,
        settingName: SettingName.NAMES.RecoveryCodes,
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
