import { SessionTokenData, TokenEncoderInterface } from '@standardnotes/security'
import 'reflect-metadata'
import { Logger } from 'winston'

import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { User } from '../User/User'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'
import { ApiVersion } from '../Api/ApiVersion'

describe('AuthResponseFactory20190520', () => {
  let userProjector: ProjectorInterface<User>
  let user: User
  let logger: Logger
  let tokenEncoder: TokenEncoderInterface<SessionTokenData>

  const createFactory = () => new AuthResponseFactory20190520(userProjector, tokenEncoder, logger)

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
    const result = await createFactory().createResponse({
      user,
      apiVersion: ApiVersion.create(ApiVersion.VERSIONS.v20161215).getValue(),
      userAgent: 'Google Chrome',
      ephemeralSession: false,
      readonlyAccess: false,
    })

    expect(result.legacyResponse).toEqual({
      user: { foo: 'bar' },
      token: 'foobar',
    })
  })
})
