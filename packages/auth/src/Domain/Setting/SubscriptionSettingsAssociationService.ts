import { SubscriptionName } from '@standardnotes/common'
import { PermissionName } from '@standardnotes/features'
import { SubscriptionSettingName } from '@standardnotes/settings'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { EncryptionVersion } from '../Encryption/EncryptionVersion'
import { Permission } from '../Permission/Permission'
import { RoleRepositoryInterface } from '../Role/RoleRepositoryInterface'
import { RoleToSubscriptionMapInterface } from '../Role/RoleToSubscriptionMapInterface'

import { SettingDescription } from './SettingDescription'
import { SubscriptionSettingsAssociationServiceInterface } from './SubscriptionSettingsAssociationServiceInterface'

@injectable()
export class SubscriptionSettingsAssociationService implements SubscriptionSettingsAssociationServiceInterface {
  constructor(
    @inject(TYPES.RoleToSubscriptionMap) private roleToSubscriptionMap: RoleToSubscriptionMapInterface,
    @inject(TYPES.RoleRepository) private roleRepository: RoleRepositoryInterface,
  ) {}

  private readonly settingsToSubscriptionNameMap = new Map<
    SubscriptionName,
    Map<SubscriptionSettingName, SettingDescription>
  >([
    [
      SubscriptionName.PlusPlan,
      new Map([
        [
          SubscriptionSettingName.FileUploadBytesUsed,
          { sensitive: false, serverEncryptionVersion: EncryptionVersion.Unencrypted, value: '0', replaceable: false },
        ],
      ]),
    ],
    [
      SubscriptionName.ProPlan,
      new Map([
        [
          SubscriptionSettingName.FileUploadBytesUsed,
          { sensitive: false, serverEncryptionVersion: EncryptionVersion.Unencrypted, value: '0', replaceable: false },
        ],
      ]),
    ],
  ])

  async getDefaultSettingsAndValuesForSubscriptionName(
    subscriptionName: SubscriptionName,
  ): Promise<Map<SubscriptionSettingName, SettingDescription> | undefined> {
    const defaultSettings = this.settingsToSubscriptionNameMap.get(subscriptionName)

    if (defaultSettings === undefined) {
      return undefined
    }

    defaultSettings.set(SubscriptionSettingName.FileUploadBytesLimit, {
      sensitive: false,
      serverEncryptionVersion: EncryptionVersion.Unencrypted,
      value: (await this.getFileUploadLimit(subscriptionName)).toString(),
      replaceable: true,
    })

    return defaultSettings
  }

  async getFileUploadLimit(subscriptionName: SubscriptionName): Promise<number> {
    const roleName = this.roleToSubscriptionMap.getRoleNameForSubscriptionName(subscriptionName)

    const role = await this.roleRepository.findOneByName(roleName as string)
    if (role === null) {
      throw new Error(`Could not find role with name: ${roleName}`)
    }

    const permissions = await role.permissions

    const uploadLimit100GB = permissions.find(
      (permission: Permission) => permission.name === PermissionName.FilesMaximumStorageTier,
    )
    if (uploadLimit100GB !== undefined) {
      return 107_374_182_400
    }

    const uploadLimit100MB = permissions.find(
      (permission: Permission) => permission.name === PermissionName.FilesLowStorageTier,
    )
    if (uploadLimit100MB !== undefined) {
      return 104_857_600
    }

    return 0
  }
}
