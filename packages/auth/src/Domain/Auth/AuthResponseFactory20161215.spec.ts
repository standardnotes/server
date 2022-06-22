import 'reflect-metadata'

import { SessionTokenData, TokenEncoderInterface } from '@standardnotes/auth'
import { Logger } from 'winston'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { User } from '../User/User'
import { AuthResponseFactory20161215 } from './AuthResponseFactory20161215'

describe('AuthResponseFactory20161215', () => {
  let userProjector: ProjectorInterface<User>
  let tokenEncoder: TokenEncoderInterface<SessionTokenData>
  let user: User
  let logger: Logger

  const createFactory = () => new AuthResponseFactory20161215(userProjector, tokenEncoder, logger)

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    userProjector = {} as jest.Mocked<ProjectorInterface<User>>
    userProjector.projectSimple = jest.fn().mockReturnValue({ foo: 'bar' })

    user = {} as jest.Mocked<User>
    user.encryptedPassword = 'test123'

    tokenEncoder = {} as jest.Mocked<TokenEncoderInterface<SessionTokenData>>
    tokenEncoder.encodeToken = jest.fn().mockReturnValue('foobar')
  })

  it('should create a 20161215 auth response', async () => {
    const response = await createFactory().createResponse({
      user,
      apiVersion: '20161215',
      userAgent: 'Google Chrome',
      ephemeralSession: false,
      readonlyAccess: false,
    })

    expect(response).toEqual({
      user: { foo: 'bar' },
      token: 'foobar',
    })
  })
})
