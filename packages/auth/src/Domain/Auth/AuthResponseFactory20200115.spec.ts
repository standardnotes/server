import 'reflect-metadata'

import { SessionTokenData, TokenEncoderInterface } from '@standardnotes/security'
import { SessionBody } from '@standardnotes/responses'
import { Logger } from 'winston'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { SessionServiceInterface } from '../Session/SessionServiceInterface'
import { KeyParamsFactoryInterface } from '../User/KeyParamsFactoryInterface'
import { User } from '../User/User'
import { AuthResponseFactory20200115 } from './AuthResponseFactory20200115'

describe('AuthResponseFactory20200115', () => {
  let sessionService: SessionServiceInterface
  let keyParamsFactory: KeyParamsFactoryInterface
  let userProjector: ProjectorInterface<User>
  let user: User
  let sessionPayload: SessionBody
  let logger: Logger
  let tokenEncoder: TokenEncoderInterface<SessionTokenData>

  const createFactory = () =>
    new AuthResponseFactory20200115(sessionService, keyParamsFactory, userProjector, tokenEncoder, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    sessionPayload = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      access_expiration: 123,
      refresh_expiration: 234,
      readonly_access: false,
    }

    sessionService = {} as jest.Mocked<SessionServiceInterface>
    sessionService.createNewSessionForUser = jest.fn().mockReturnValue(sessionPayload)
    sessionService.createNewEphemeralSessionForUser = jest.fn().mockReturnValue(sessionPayload)

    keyParamsFactory = {} as jest.Mocked<KeyParamsFactoryInterface>
    keyParamsFactory.create = jest.fn().mockReturnValue({
      key1: 'value1',
      key2: 'value2',
    })

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    user = {} as jest.Mocked<User>
    user.encryptedPassword = 'test123'

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<SessionTokenData>>
    tokenEncoder.encodeToken = jest.fn().mockReturnValue('foobar')
  })

  it('should create a 20161215 auth response if user does not support sessions', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(false)

    const response = await createFactory().createResponse({
      user,
      apiVersion: '20161215',
      userAgent: 'Google Chrome',
      ephemeralSession: false,
      readonlyAccess: false,
    })

    expect(response).toEqual({
      user: { foo: 'bar' },
      token: expect.any(String),
    })
  })

  it('should create a 20200115 auth response', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    const response = await createFactory().createResponse({
      user,
      apiVersion: '20200115',
      userAgent: 'Google Chrome',
      ephemeralSession: false,
      readonlyAccess: false,
    })

    expect(response).toEqual({
      key_params: {
        key1: 'value1',
        key2: 'value2',
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        access_expiration: 123,
        refresh_expiration: 234,
        readonly_access: false,
      },
      user: {
        foo: 'bar',
      },
    })
  })

  it('should create a 20200115 auth response with an ephemeral session', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    const response = await createFactory().createResponse({
      user,
      apiVersion: '20200115',
      userAgent: 'Google Chrome',
      ephemeralSession: true,
      readonlyAccess: false,
    })

    expect(response).toEqual({
      key_params: {
        key1: 'value1',
        key2: 'value2',
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        access_expiration: 123,
        refresh_expiration: 234,
        readonly_access: false,
      },
      user: {
        foo: 'bar',
      },
    })
  })

  it('should create a 20200115 auth response with a read only session', async () => {
    user.supportsSessions = jest.fn().mockReturnValue(true)

    sessionService.createNewSessionForUser = jest.fn().mockReturnValue({
      ...sessionPayload,
      readonly_access: true,
    })

    const response = await createFactory().createResponse({
      user,
      apiVersion: '20200115',
      userAgent: 'Google Chrome',
      ephemeralSession: false,
      readonlyAccess: true,
    })

    expect(response).toEqual({
      key_params: {
        key1: 'value1',
        key2: 'value2',
      },
      session: {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        access_expiration: 123,
        refresh_expiration: 234,
        readonly_access: true,
      },
      user: {
        foo: 'bar',
      },
    })
  })
})
