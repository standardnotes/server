import { Result, SettingName, UseCaseInterface } from '@standardnotes/domain-core'
import { TriggerEmailBackupForUser } from '../TriggerEmailBackupForUser/TriggerEmailBackupForUser'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { TriggerEmailBackupForAllUsersDTO } from './TriggerEmailBackupForAllUsersDTO'
import { Logger } from 'winston'

export class TriggerEmailBackupForAllUsers implements UseCaseInterface<void> {
  private PAGING_LIMIT = 100

  constructor(
    private settingRepository: SettingRepositoryInterface,
    private triggerEmailBackupForUserUseCase: TriggerEmailBackupForUser,
    private logger: Logger,
  ) {}

  async execute(dto: TriggerEmailBackupForAllUsersDTO): Promise<Result<void>> {
    const emailBackupFrequencySettingName = SettingName.create(SettingName.NAMES.EmailBackupFrequency).getValue()

    const allSettingsCount = await this.settingRepository.countAllByNameAndValue({
      name: emailBackupFrequencySettingName,
      value: dto.backupFrequency,
    })

    this.logger.info(`Found ${allSettingsCount} users with email backup frequency set to ${dto.backupFrequency}`)

    let failedUsers = 0
    const numberOfPages = Math.ceil(allSettingsCount / this.PAGING_LIMIT)
    for (let i = 0; i < numberOfPages; i++) {
      const settings = await this.settingRepository.findAllByNameAndValue({
        name: emailBackupFrequencySettingName,
        value: dto.backupFrequency,
        offset: i * this.PAGING_LIMIT,
        limit: this.PAGING_LIMIT,
      })

      for (const setting of settings) {
        const result = await this.triggerEmailBackupForUserUseCase.execute({
          userUuid: setting.props.userUuid.value,
        })
        /* istanbul ignore next */
        if (result.isFailed()) {
          this.logger.error(`Failed to trigger email backup for user: ${result.getError()}`, {
            userId: setting.props.userUuid.value,
          })
          failedUsers++
        }
      }
    }

    /* istanbul ignore next */
    if (failedUsers > 0) {
      this.logger.error(`Failed to trigger email backup for ${failedUsers} users`)
    }

    return Result.ok()
  }
}
