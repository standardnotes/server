import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { RoleName, SettingName } from '@standardnotes/domain-core'
import { PermissionName } from '@standardnotes/features'

import { RoleRepositoryInterface } from '../Role/RoleRepositoryInterface'
import { RoleToSubscriptionMapInterface } from '../Role/RoleToSubscriptionMapInterface'
import { Role } from '../Role/Role'
import { Permission } from '../Permission/Permission'
import { SubscriptionSettingsAssociationService } from './SubscriptionSettingsAssociationService'
import { SettingDescription } from './SettingDescription'

describe('SubscriptionSettingsAssociationService', () => {
  let roleToSubscriptionMap: RoleToSubscriptionMapInterface
  let roleRepository: RoleRepositoryInterface
  let role: Role

  const createService = () => new SubscriptionSettingsAssociationService(roleToSubscriptionMap, roleRepository)

  beforeEach(() => {
    roleToSubscriptionMap = {} as jest.Mocked<RoleToSubscriptionMapInterface>
    roleToSubscriptionMap.getRoleNameForSubscriptionName = jest.fn().mockReturnValue(RoleName.NAMES.PlusUser)

    role = {} as jest.Mocked<Role>

    roleRepository = {} as jest.Mocked<RoleRepositoryInterface>
    roleRepository.findOneByName = jest.fn().mockReturnValue(role)
  })

  it('should return default to 0 on file upload limit if user subscription permissions could not be found', async () => {
    role.permissions = Promise.resolve([])
    roleRepository.findOneByName = jest.fn().mockReturnValue(role)

    const limit = await createService().getFileUploadLimit(SubscriptionName.PlusPlan)

    expect(limit).toEqual(0)
  })

  it('should return the default set of setting values for a pro subscription', async () => {
    const permission = {
      name: PermissionName.FilesMaximumStorageTier,
    } as jest.Mocked<Permission>
    role.permissions = Promise.resolve([permission])
    roleRepository.findOneByName = jest.fn().mockReturnValue(role)

    const settings = await createService().getDefaultSettingsAndValuesForSubscriptionName(SubscriptionName.ProPlan)

    expect(settings).not.toBeUndefined()

    const flatSettings = [...(settings as Map<string, SettingDescription>).keys()]
    expect(flatSettings).toEqual(['FILE_UPLOAD_BYTES_USED', 'MUTE_SIGN_IN_EMAILS', 'FILE_UPLOAD_BYTES_LIMIT'])
    expect(settings?.get(SettingName.NAMES.FileUploadBytesLimit)).toEqual({
      value: '107374182400',
      replaceable: true,
    })
  })

  it('should return the default set of setting values for a plus subscription', async () => {
    const permission = {
      name: PermissionName.FilesLowStorageTier,
    } as jest.Mocked<Permission>
    role.permissions = Promise.resolve([permission])
    roleRepository.findOneByName = jest.fn().mockReturnValue(role)

    const settings = await createService().getDefaultSettingsAndValuesForSubscriptionName(SubscriptionName.PlusPlan)

    expect(settings).not.toBeUndefined()

    const flatSettings = [...(settings as Map<string, SettingDescription>).keys()]
    expect(flatSettings).toEqual(['FILE_UPLOAD_BYTES_USED', 'MUTE_SIGN_IN_EMAILS', 'FILE_UPLOAD_BYTES_LIMIT'])
    expect(settings?.get(SettingName.NAMES.FileUploadBytesLimit)).toEqual({
      value: '104857600',
      replaceable: true,
    })
  })

  it('should throw error if a role is not found when getting default setting values for a subscription', async () => {
    const permission = {
      name: PermissionName.Files,
    } as jest.Mocked<Permission>
    role.permissions = Promise.resolve([permission])
    roleRepository.findOneByName = jest.fn().mockReturnValue(null)

    let caughtError = null
    try {
      await createService().getDefaultSettingsAndValuesForSubscriptionName(SubscriptionName.ProPlan)
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })

  it('should return undefined set of setting values for an undefined subscription', async () => {
    const settings = await createService().getDefaultSettingsAndValuesForSubscriptionName('foobar' as SubscriptionName)

    expect(settings).toBeUndefined()
  })
})
