import { inject, injectable } from 'inversify'
import { UpdateSettingDto } from './UpdateSettingDto'
import { UpdateSettingResponse } from './UpdateSettingResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import TYPES from '../../../Bootstrap/Types'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { CreateOrReplaceSettingResponse } from '../../Setting/CreateOrReplaceSettingResponse'
import { SettingProjector } from '../../../Projection/SettingProjector'
import { Logger } from 'winston'
import { SettingServiceInterface } from '../../Setting/SettingServiceInterface'
import { User } from '../../User/User'
import { SettingName } from '@standardnotes/settings'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { SettingsAssociationServiceInterface } from '../../Setting/SettingsAssociationServiceInterface'
import { SubscriptionSettingServiceInterface } from '../../Setting/SubscriptionSettingServiceInterface'
import { UserSubscriptionServiceInterface } from '../../Subscription/UserSubscriptionServiceInterface'
import { CreateOrReplaceSubscriptionSettingResponse } from '../../Setting/CreateOrReplaceSubscriptionSettingResponse'
import { SubscriptionSettingProjector } from '../../../Projection/SubscriptionSettingProjector'

@injectable()
export class UpdateSetting implements UseCaseInterface {
  constructor(
    @inject(TYPES.SettingService) private settingService: SettingServiceInterface,
    @inject(TYPES.SubscriptionSettingService) private subscriptionSettingService: SubscriptionSettingServiceInterface,
    @inject(TYPES.UserSubscriptionService) private userSubscriptionService: UserSubscriptionServiceInterface,
    @inject(TYPES.SettingProjector) private settingProjector: SettingProjector,
    @inject(TYPES.SubscriptionSettingProjector) private subscriptionSettingProjector: SubscriptionSettingProjector,
    @inject(TYPES.SettingsAssociationService) private settingsAssociationService: SettingsAssociationServiceInterface,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.RoleService) private roleService: RoleServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: UpdateSettingDto): Promise<UpdateSettingResponse> {
    const settingNameOrError = SettingName.create(dto.props.name)
    if (settingNameOrError.isFailed()) {
      return {
        success: false,
        error: {
          message: settingNameOrError.getError(),
        },
        statusCode: 400,
      }
    }
    const settingName = settingNameOrError.getValue()

    this.logger.debug('[%s] Updating setting: %O', dto.userUuid, dto)

    const { userUuid, props } = dto

    const user = await this.userRepository.findOneByUuid(userUuid)

    if (user === null) {
      return {
        success: false,
        error: {
          message: `User ${userUuid} not found.`,
        },
        statusCode: 404,
      }
    }

    if (!(await this.userHasPermissionToUpdateSetting(user, settingName))) {
      return {
        success: false,
        error: {
          message: `User ${userUuid} is not permitted to change the setting.`,
        },
        statusCode: 401,
      }
    }

    props.serverEncryptionVersion = this.settingsAssociationService.getEncryptionVersionForSetting(settingName)
    props.sensitive = this.settingsAssociationService.getSensitivityForSetting(settingName)

    if (settingName.isASubscriptionSetting()) {
      const { regularSubscription, sharedSubscription } =
        await this.userSubscriptionService.findRegularSubscriptionForUserUuid(user.uuid)
      const subscription = sharedSubscription ?? regularSubscription
      if (!subscription) {
        return {
          success: false,
          error: {
            message: `User ${userUuid} has no subscription to change a subscription setting.`,
          },
          statusCode: 401,
        }
      }

      const response = await this.subscriptionSettingService.createOrReplace({
        userSubscription: subscription,
        props,
      })

      return {
        success: true,
        setting: await this.subscriptionSettingProjector.projectSimple(response.subscriptionSetting),
        statusCode: this.statusToStatusCode(response),
      }
    }

    const response = await this.settingService.createOrReplace({
      user,
      props,
    })

    return {
      success: true,
      setting: await this.settingProjector.projectSimple(response.setting),
      statusCode: this.statusToStatusCode(response),
    }
  }

  /* istanbul ignore next */
  private statusToStatusCode(
    response: CreateOrReplaceSettingResponse | CreateOrReplaceSubscriptionSettingResponse,
  ): number {
    if (response.status === 'created') {
      return 201
    }
    if (response.status === 'replaced') {
      return 200
    }

    const exhaustiveCheck: never = response.status
    throw new Error(`Unrecognized status: ${exhaustiveCheck}!`)
  }

  private async userHasPermissionToUpdateSetting(user: User, settingName: SettingName): Promise<boolean> {
    const settingIsMutableByClient = this.settingsAssociationService.isSettingMutableByClient(settingName)
    if (!settingIsMutableByClient) {
      return false
    }

    const permissionAssociatedWithSetting =
      this.settingsAssociationService.getPermissionAssociatedWithSetting(settingName)
    if (permissionAssociatedWithSetting === undefined) {
      return true
    }

    return this.roleService.userHasPermission(user.uuid, permissionAssociatedWithSetting)
  }
}
