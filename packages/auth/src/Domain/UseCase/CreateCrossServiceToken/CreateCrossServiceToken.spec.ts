import 'reflect-metadata'

import { TokenEncoderInterface, CrossServiceTokenData } from '@standardnotes/security'
import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { Session } from '../../Session/Session'
import { User } from '../../User/User'
import { Role } from '../../Role/Role'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'

import { CreateCrossServiceToken } from './CreateCrossServiceToken'
import { RoleToSubscriptionMapInterface } from '../../Role/RoleToSubscriptionMapInterface'
import { TraceSession } from '../TraceSession/TraceSession'
import { Logger } from 'winston'
import { Result, RoleName, SubscriptionPlanName } from '@standardnotes/domain-core'

describe('CreateCrossServiceToken', () => {
  let userProjector: ProjectorInterface<User>
  let sessionProjector: ProjectorInterface<Session>
  let roleProjector: ProjectorInterface<Role>
  let tokenEncoder: TokenEncoderInterface<CrossServiceTokenData>
  let userRepository: UserRepositoryInterface
  let roleToSubscriptionMap: RoleToSubscriptionMapInterface
  let traceSession: TraceSession
  let logger: Logger
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
      roleToSubscriptionMap,
      traceSession,
      logger,
    )

  beforeEach(() => {
    session = {} as jest.Mocked<Session>

    user = {
      uuid: '1-2-3',
      email: 'test@test.te',
    } as jest.Mocked<User>
    user.roles = Promise.resolve([role])

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ uuid: '1-2-3', email: 'test@test.te' })

    roleProjector = {} as jest.Mocked<ProjectorInterface<Role>>
    roleProjector.projectSimple = jest.fn().mockReturnValue({ name: 'role1', uuid: '1-3-4' })

    sessionProjector = {} as jest.Mocked<ProjectorInterface<Session>>
    sessionProjector.projectCustom = jest.fn().mockReturnValue({ foo: 'bar' })
    sessionProjector.projectSimple = jest.fn().mockReturnValue({ test: 'test' })

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<CrossServiceTokenData>>
    tokenEncoder.encodeExpirableToken = jest.fn().mockReturnValue('foobar')

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUuid = jest.fn().mockReturnValue(user)

    roleToSubscriptionMap = {} as jest.Mocked<RoleToSubscriptionMapInterface>
    roleToSubscriptionMap.filterSubscriptionRoles = jest.fn().mockReturnValue([RoleName.NAMES.PlusUser])
    roleToSubscriptionMap.getSubscriptionNameForRoleName = jest
      .fn()
      .mockReturnValue(SubscriptionPlanName.NAMES.PlusPlan)

    traceSession = {} as jest.Mocked<TraceSession>
    traceSession.execute = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
    logger.debug = jest.fn()
  })

  it('should create a cross service token for user', async () => {
    await createUseCase().execute({
      user,
      session,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      username: 'test@test.te',
      subscriptionPlanName: 'PLUS_PLAN',
    })
    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
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
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
      },
      60,
    )
  })

  it('should create a cross service token for user by user uuid', async () => {
    await createUseCase().execute({
      userUuid: '1-2-3',
    })

    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
      },
      60,
    )
  })

  it('should throw an error if user does not exist', async () => {
    userRepository.findOneByUuid = jest.fn().mockReturnValue(null)

    let caughtError = null
    try {
      await createUseCase().execute({
        userUuid: '1-2-3',
      })
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })

  it('should trace session without a subscription role', async () => {
    roleToSubscriptionMap.filterSubscriptionRoles = jest.fn().mockReturnValue([])

    await createUseCase().execute({
      user,
      session,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      username: 'test@test.te',
      subscriptionPlanName: null,
    })
    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
      },
      60,
    )
  })

  it('should trace session without a subscription', async () => {
    roleToSubscriptionMap.getSubscriptionNameForRoleName = jest.fn().mockReturnValue(undefined)

    await createUseCase().execute({
      user,
      session,
    })

    expect(traceSession.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      username: 'test@test.te',
      subscriptionPlanName: null,
    })
    expect(tokenEncoder.encodeExpirableToken).toHaveBeenCalledWith(
      {
        roles: [
          {
            name: 'role1',
            uuid: '1-3-4',
          },
        ],
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
      },
      60,
    )
  })

  it('should create token if tracing session throws an error', async () => {
    traceSession.execute = jest.fn().mockRejectedValue(new Error('test'))

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
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
      },
      60,
    )
  })

  it('should create token if tracing session fails', async () => {
    traceSession.execute = jest.fn().mockReturnValue(Result.fail('Ooops'))

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
        session: {
          test: 'test',
        },
        user: {
          email: 'test@test.te',
          uuid: '1-2-3',
        },
      },
      60,
    )
  })
})
