import 'reflect-metadata'
import { Logger } from 'winston'

import { AuthResponseFactory20161215 } from './AuthResponseFactory20161215'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'
import { AuthResponseFactory20200115 } from './AuthResponseFactory20200115'
import { AuthResponseFactoryResolver } from './AuthResponseFactoryResolver'
import { ApiVersion } from '../Api/ApiVersion'

describe('AuthResponseFactoryResolver', () => {
  let authResponseFactory20161215: AuthResponseFactory20161215
  let authResponseFactory20190520: AuthResponseFactory20190520
  let authResponseFactory20200115: AuthResponseFactory20200115
  let logger: Logger

  const createResolver = () =>
    new AuthResponseFactoryResolver(
      authResponseFactory20161215,
      authResponseFactory20190520,
      authResponseFactory20200115,
      logger,
    )

  beforeEach(() => {
    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()

    authResponseFactory20161215 = {} as jest.Mocked<AuthResponseFactory20161215>
    authResponseFactory20190520 = {} as jest.Mocked<AuthResponseFactory20190520>
    authResponseFactory20200115 = {} as jest.Mocked<AuthResponseFactory20200115>
  })

  it('should resolve 2016 response factory', () => {
    expect(
      createResolver().resolveAuthResponseFactoryVersion(ApiVersion.create(ApiVersion.VERSIONS.v20161215).getValue()),
    ).toEqual(authResponseFactory20161215)
  })

  it('should resolve 2019 response factory', () => {
    expect(
      createResolver().resolveAuthResponseFactoryVersion(ApiVersion.create(ApiVersion.VERSIONS.v20190520).getValue()),
    ).toEqual(authResponseFactory20190520)
  })

  it('should resolve 2020 response factory', () => {
    expect(
      createResolver().resolveAuthResponseFactoryVersion(ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue()),
    ).toEqual(authResponseFactory20200115)
  })

  it('should resolve 2024 response factory', () => {
    expect(
      createResolver().resolveAuthResponseFactoryVersion(ApiVersion.create(ApiVersion.VERSIONS.v20240226).getValue()),
    ).toEqual(authResponseFactory20200115)
  })
})
