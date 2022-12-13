import { inject, injectable } from 'inversify'

import TYPES from '../../../Bootstrap/Types'
import { SettingRepositoryInterface } from '../../Setting/SettingRepositoryInterface'
import { UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Setting } from '../../Setting/Setting'

@injectable()
export class GetSettings implements UseCaseInterface<Setting[]> {
  constructor(
    @inject(TYPES.SettingRepository) private settingRepository: SettingRepositoryInterface,
    @inject(TYPES.Crypter) private crypter: CrypterInterface,
  ) {}

  async execute(dto: GetSettingsDto): Promise<GetSettingsResponse> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {

    }
    let settings = await this.settingRepository.findAllByUserUuid(userUuid)
  }
}
