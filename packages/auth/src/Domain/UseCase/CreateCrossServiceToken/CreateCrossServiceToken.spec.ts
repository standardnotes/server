import 'reflect-metadata'

import { TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'
import { Role } from '../../Role/Role'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { CreateCrossServiceToken } from './CreateCrossServiceToken'
import { GetSetting } from '../GetSetting/GetSetting'
import {
  Result,
  SharedVaultUser,
  SharedVaultUserPermission,
  Timestamps,
  TransitionStatus,
  Uuid,
} from '@standardnotes/domain-core'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'

describe('CreateCrossServiceToken', () => {
  let userProjector: ProjectorInterface<User>
  let sessionProjector: ProjectorInterface<Session>
  let roleProjector: ProjectorInterface<Role>
  let tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>
  let userRepository: UserRepositoryInterface
  let getSettingUseCase: GetSetting
  let transitionStatusRepository: TransitionStatusRepositoryInterface
  let sharedVaultUserRepository: SharedVaultUserRepositoryInterface
  const jwtTTL = 60

  let session: Session
  let user: User
  let role: Role

  const createUseCase = () =>
    new CreateCrossServiceToken(
      userProjector,
      sessionProjector,
      roleProjector,
      tokenEncoder,
      userRepository,
      jwtTTL,
      getSettingUseCase,
      transitionStatusRepository,
      sharedVaultUserRepository,
    )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>

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

    getSettingUseCase = {} as jest.Mocked<GetSetting>
    getSettingUseCase.execute = jest.fn().mockReturnValue(Result.ok({ setting: { value: '100' } }))

    transitionStatusRepository = {} as jest.Mocked<TransitionStatusRepositoryInterface>
    transitionStatusRepository.getStatus = jest
      .fn()
      .mockReturnValue(TransitionStatus.create(TransitionStatus.STATUSES.Verified).getValue())

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
        ongoing_transition: false,
        ongoing_revisions_transition: false,
      },
      60,
    )
  })

  it('should create a cross service token for user that has an ongoing transaction', async () => {
    transitionStatusRepository.getStatus = jest
      .fn()
      .mockReturnValue(TransitionStatus.create(TransitionStatus.STATUSES.InProgress).getValue())

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
        ongoing_transition: true,
        ongoing_revisions_transition: true,
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
        ongoing_transition: false,
        ongoing_revisions_transition: false,
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
        ongoing_transition: false,
        ongoing_revisions_transition: false,
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
          ongoing_revisions_transition: false,
          ongoing_transition: false,
        },
        60,
      )
    })

    it('should throw an error if shared vault owner context is sensitive', async () => {
      getSettingUseCase.execute = jest.fn().mockReturnValue(Result.ok({ sensitive: true }))

      const result = await createUseCase().execute({
        user,
        session,
        sharedVaultOwnerContext: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
    })

    it('should throw an error if it fails to retrieve shared vault owner setting', async () => {
      getSettingUseCase.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

      const result = await createUseCase().execute({
        user,
        session,
        sharedVaultOwnerContext: '00000000-0000-0000-0000-000000000000',
      })

      expect(result.isFailed()).toBeTruthy()
    })
  })
})
