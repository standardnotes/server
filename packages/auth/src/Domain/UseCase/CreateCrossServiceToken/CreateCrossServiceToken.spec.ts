import 'reflect-metadata'

import { TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'
import { Role } from '../../Role/Role'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { CreateCrossServiceToken } from './CreateCrossServiceToken'
import {
  Result,
  RoleName,
  SettingName,
  SharedVaultUser,
  SharedVaultUserPermission,
  Timestamps,
  Uuid,
} from '@standardnotes/domain-core'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'
import { GetSubscriptionSetting } from '../GetSubscriptionSetting/GetSubscriptionSetting'
import { GetRegularSubscriptionForUser } from '../GetRegularSubscriptionForUser/GetRegularSubscriptionForUser'
import { UserSubscription } from '../../Subscription/UserSubscription'
import { SubscriptionSetting } from '../../Setting/SubscriptionSetting'
import { EncryptionVersion } from '../../Encryption/EncryptionVersion'
import { GetActiveSessionsForUser } from '../GetActiveSessionsForUser'
import { Permission } from '../../Permission/Permission'

describe('CreateCrossServiceToken', () => {
  let userProjector: ProjectorInterface<User>
  let sessionProjector: ProjectorInterface<Session>
  let roleProjector: ProjectorInterface<Role>
  let tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>
  let userRepository: UserRepositoryInterface
  let getRegularSubscription: GetRegularSubscriptionForUser
  let getSubscriptionSetting: GetSubscriptionSetting
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  let getActiveSessionsForUser: GetActiveSessionsForUser
  const jwtTTL = 60

  let session: Session
  let user: User
  let role: Role
  let permission: Permission

  const createUseCase = (
    applicationVersionThresholdForTokenVersion2?: string,
    applicationVersionThresholdForTokenVersion3?: string,
  ) =>
    new CreateCrossServiceToken(
      userProjector,
      sessionProjector,
      roleProjector,
      tokenEncoder,
      userRepository,
      jwtTTL,
      getRegularSubscription,
      getSubscriptionSetting,
      sharedVaultUserRepository,
      getActiveSessionsForUser,
      applicationVersionThresholdForTokenVersion2,
      applicationVersionThresholdForTokenVersion3,
    )

  beforeEach(() => {
    permission = {
      name: 'server:content-limit',
    } as jest.Mocked<Permission>

    session = {} as jest.Mocked<Session>

    getActiveSessionsForUser = {} as jest.Mocked<GetActiveSessionsForUser>
    getActiveSessionsForUser.execute = jest.fn().mockReturnValue({ sessions: [session] })

    role = {
      name: 'test',
    } as jest.Mocked<Role>
    role.permissions = Promise.resolve([])

    user = {
      uuid: '00000000-0000-0000-0000-000000000000',
      email: 'test@test.te',
    } as jest.Mocked<User>
    user.roles = Promise.resolve([role])

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest
      .fn()
      .mockReturnValue({ uuid: '00000000-0000-0000-0000-000000000000', email: 'test@test.te' })

    roleProjector = {} as jest.Mocked<ProjectorInterface<Role>>
    roleProjector.projectSimple = jest.fn().mockReturnValue({ name: 'role1', uuid: '1-3-4' })

    sessionProjector = {} as jest.Mocked<ProjectorInterface<Session>>
    sessionProjector.projectCustom = jest.fn().mockReturnValue({ foo: 'bar' })
    sessionProjector.projectSimple = jest.fn().mockReturnValue({ test: 'test' })

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<CrossServiceTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    getSubscriptionSetting = {} as jest.Mocked<GetSubscriptionSetting>
    getSubscriptionSetting.execute = jest.fn().mockReturnValue(
      Result.ok({
        setting: SubscriptionSetting.create({
          sensitive: false,
          name: SettingName.NAMES.FileUploadBytesLimit,
          value: '100',
          timestamps: Timestamps.create(123456789, 123456789).getValue(),
          serverEncryptionVersion: EncryptionVersion.Unencrypted,
          userSubscriptionUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        }).getValue(),
      }),
    )

    getRegularSubscription = {} as jest.Mocked<GetRegularSubscriptionForUser>
    getRegularSubscription.execute = jest.fn().mockReturnValue(Result.fail('not found'))

    sharedVaultUserRepository = {} as jest.Mocked<SharedVaultUserRepositoryInterface>
    sharedVaultUserRepository.findByUserUuid = jest.fn().mockReturnValue([
      SharedVaultUser.create({
        permission: SharedVaultUserPermission.create('read').getValue(),
        sharedVaultUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        timestamps: Timestamps.create(123456789, 123456789).getValue(),
        userUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
        isDesignatedSurvivor: false,
      }).getValue(),
    ])
  })

  it('should create a cross service token for user', async () => {
    await createUseCase().execute({
      user,
      session,
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        belongs_to_shared_vaults: [
          {
            shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
            permission: 'read',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '00000000-0000-0000-0000-000000000000',
        },
        hasContentLimit: false,
        version: 1,
      },
      60,
    )
  })

  it('should create a cross service token for user with content limitation', async () => {
    role.name = RoleName.NAMES.CoreUser
    role.permissions = Promise.resolve([permission])

    user.roles = Promise.resolve([role])

    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    await createUseCase().execute({
      user,
      session,
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        belongs_to_shared_vaults: [
          {
            shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
            permission: 'read',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '00000000-0000-0000-0000-000000000000',
        },
        hasContentLimit: true,
        version: 1,
      },
      60,
    )
  })

  it('should create a cross service token for user without a session', async () => {
    await createUseCase().execute({
      user,
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        belongs_to_shared_vaults: [
          {
            shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
            permission: 'read',
          },
        ],
        user: {
          email: 'test@test.te',
          uuid: '00000000-0000-0000-0000-000000000000',
        },
        hasContentLimit: false,
        version: 1,
      },
      60,
    )
  })

  it('should create a cross service token for user by user uuid', async () => {
    await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        belongs_to_shared_vaults: [
          {
            shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
            permission: 'read',
          },
        ],
        user: {
          email: 'test@test.te',
          uuid: '00000000-0000-0000-0000-000000000000',
        },
        hasContentLimit: false,
        version: 1,
      },
      60,
    )
  })

  it('should create a cross service token for a user and a specific session', async () => {
    await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        belongs_to_shared_vaults: [
          {
            shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
            permission: 'read',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '00000000-0000-0000-0000-000000000000',
        },
        hasContentLimit: false,
        version: 1,
      },
      60,
    )
  })

  it('should create a cross service token for a user and specific session if the session is missing', async () => {
    getActiveSessionsForUser.execute = jest.fn().mockReturnValue({ sessions: [] })

    await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
      sessionUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        belongs_to_shared_vaults: [
          {
            shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
            permission: 'read',
          },
        ],
        user: {
          email: 'test@test.te',
          uuid: '00000000-0000-0000-0000-000000000000',
        },
        hasContentLimit: false,
        version: 1,
      },
      60,
    )
  })

  it('should throw an error if user does not exist', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    const result = await createUseCase().execute({
      userUuid: '00000000-0000-0000-0000-000000000000',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  it('should throw an error if user uuid is invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: 'invalid',
    })

    expect(result.isFailed()).toBeTruthy()
  })

  describe('shared vault context', () => {
    it('should add shared vault context if shared vault owner uuid is provided', async () => {
      const regularSubscription = {} as jest.Mocked<UserSubscription>
      getRegularSubscription.execute = jest.fn().mockReturnValue(Result.ok(regularSubscription))

      await createUseCase().execute({
        user,
        session,
        sharedVaultOwnerContext: '00000000-0000-0000-0000-000000000000',
      })

      expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
        {
          roles: [
            {
              name: 'role1',
              uuid: '1-3-4',
            },
          ],
          belongs_to_shared_vaults: [
            {
              shared_vault_uuid: '00000000-0000-0000-0000-000000000000',
              permission: 'read',
            },
          ],
          session: {
            test: 'test',
          },
          shared_vault_owner_context: {
            upload_bytes_limit: 100,
          },
          user: {
            email: 'test@test.te',
            uuid: '00000000-0000-0000-0000-000000000000',
          },
          hasContentLimit: false,
          version: 1,
        },
        60,
      )
    })

    it('should return an error if it fails to retrieve shared vault owner subscription', async () => {
      const result = await createUseCase().execute({
        user,
        session,
        sharedVaultOwnerContext: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
    })

    it('should return an error if it fails to retrieve shared vault owner setting', async () => {
      const regularSubscription = {} as jest.Mocked<UserSubscription>
      getRegularSubscription.execute = jest.fn().mockReturnValue(Result.ok(regularSubscription))

      getSubscriptionSetting.execute = jest.fn().mockReturnValue(Result.fail('error'))

      const result = await createUseCase().execute({
        user,
        session,
        sharedVaultOwnerContext: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
    })
  })

  describe('version determination', () => {
    describe('when no threshold is configured', () => {
      it('should set version to 1 when no application version is provided', async () => {
        const useCase = createUseCase(undefined)
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(1)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should set version to 1 when application version is provided but no threshold is configured', async () => {
        const useCase = createUseCase(undefined)
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(1)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-4.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })
    })

    describe('when threshold is configured', () => {
      it('should set version to 1 when application version is equal to threshold', async () => {
        const useCase = createUseCase('2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(1)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-2.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should set version to 1 when application version is lower than threshold', async () => {
        const useCase = createUseCase('2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(1)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-1.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should set version to 2 when application version is higher than threshold', async () => {
        const useCase = createUseCase('2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(2)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-3.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should work with different client prefixes', async () => {
        const useCase = createUseCase('1.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(2)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'mobile-2.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })
    })

    describe('edge cases', () => {
      it('should set version to 1 when application version format is invalid', async () => {
        const useCase = createUseCase('2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(1)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'invalid-version',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should handle version without client prefix', async () => {
        const useCase = createUseCase('2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(2)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: '3.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should handle prerelease versions correctly', async () => {
        const useCase = createUseCase('2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(2)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-3.0.0-beta.1',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })
    })

    describe('when both thresholds are configured', () => {
      it('should set version to 1 when application version is below both thresholds', async () => {
        const useCase = createUseCase('2.0.0', '3.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(1)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-1.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should set version to 2 when application version is above version 2 threshold but below version 3 threshold', async () => {
        const useCase = createUseCase('2.0.0', '3.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(2)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-2.1.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should set version to 3 when application version is above both thresholds', async () => {
        const useCase = createUseCase('2.0.0', '3.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(3)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-4.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should return highest applicable version when application version exceeds multiple thresholds', async () => {
        const useCase = createUseCase('1.0.0', '2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(3)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'mobile-3.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should handle equal thresholds by selecting highest version', async () => {
        const useCase = createUseCase('2.0.0', '2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(3)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-2.1.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })

      it('should work when only version 3 threshold is set', async () => {
        const useCase = createUseCase(undefined, '2.0.0')
        tokenEncoder.encodeExpirableToken = jest.fn().mockImplementation((data: CrossServiceTokenData) => {
          expect(data.version).toBe(3)
          return 'mocked-token'
        })

        await useCase.execute({
          user,
          applicationVersion: 'web-3.0.0',
        })

        expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalled()
      })
    })
  })
})
