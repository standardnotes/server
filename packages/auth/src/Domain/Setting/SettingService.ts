import { SettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { User } from '../User/User'
import { CreateOrReplaceSettingDto } from './CreateOrReplaceSettingDto'
import { CreateOrReplaceSettingResponse } from './CreateOrReplaceSettingResponse'
import { FindSettingDTO } from './FindSettingDTO'
import { Setting } from './Setting'
import { SettingRepositoryInterface } from './SettingRepositoryInterface'
import { SettingServiceInterface } from './SettingServiceInterface'
import { SettingsAssociationServiceInterface } from './SettingsAssociationServiceInterface'
import { SettingInterpreterInterface } from './SettingInterpreterInterface'
import { SettingDecrypterInterface } from './SettingDecrypterInterface'
import { SettingFactoryInterface } from './SettingFactoryInterface'

@injectable()
export class SettingService implements SettingServiceInterface {
  constructor(
    @inject(TYPES.SettingFactory) private factory: SettingFactoryInterface,
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.SettingsAssociationService) private settingsAssociationService: SettingsAssociationServiceInterface,
    @inject(TYPES.SettingInterpreter) private settingInterpreter: SettingInterpreterInterface,
    @inject(TYPES.SettingDecrypter) private settingDecrypter: SettingDecrypterInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async applyDefaultSettingsUponRegistration(user: User): Promise<void> {
    let defaultSettingsWithValues = this.settingsAssociationService.getDefaultSettingsAndValuesForNewUser()
    if (user.isPotentiallyAVaultAccount()) {
      defaultSettingsWithValues = this.settingsAssociationService.getDefaultSettingsAndValuesForNewVaultAccount()
    }

    for (const settingName of defaultSettingsWithValues.keys()) {
      this.logger.debug(`Creating setting ${settingName} for user ${user.uuid}`)

      const setting = defaultSettingsWithValues.get(settingName) as {
        value: string
        sensitive: boolean
        serverEncryptionVersion: number
      }

      await this.createOrReplace({
        user,
        props: {
          name: settingName,
          unencryptedValue: setting.value,
          serverEncryptionVersion: setting.serverEncryptionVersion,
          sensitive: setting.sensitive,
        },
      })
    }
  }

  async findSettingWithDecryptedValue(dto: FindSettingDTO): Promise<Setting | null> {
    let setting: Setting | null
    if (dto.settingUuid !== undefined) {
      setting = await this.settingRepository.findOneByUuid(dto.settingUuid)
    } else {
      setting = await this.settingRepository.findLastByNameAndUserUuid(dto.settingName, dto.userUuid)
    }

    if (setting === null) {
      return null
    }

    setting.value = await this.settingDecrypter.decryptSettingValue(setting, dto.userUuid)

    return setting
  }

  async createOrReplace(dto: CreateOrReplaceSettingDto): Promise<CreateOrReplaceSettingResponse> {
    const { user, props } = dto

    const existing = await this.findSettingWithDecryptedValue({
      userUuid: user.uuid,
      settingName: props.name as SettingName,
      settingUuid: props.uuid,
    })

    if (existing === null) {
      const setting = await this.settingRepository.save(await this.factory.create(props, user))

      this.logger.debug('[%s] Created setting %s: %O', user.uuid, props.name, setting)

      await this.settingInterpreter.interpretSettingUpdated(setting, user, props.unencryptedValue)

      return {
        status: 'created',
        setting,
      }
    }

    const setting = await this.settingRepository.save(await this.factory.createReplacement(existing, props))

    this.logger.debug('[%s] Replaced existing setting %s with: %O', user.uuid, props.name, setting)

    await this.settingInterpreter.interpretSettingUpdated(setting, user, props.unencryptedValue)

    return {
      status: 'replaced',
      setting,
    }
  }
}
