import { ApiVersion } from './ApiVersion'

describe('ApiVersion', () => {
  it('should create a value object', () => {
    const valueOrError = ApiVersion.create(ApiVersion.VERSIONS.v20200115)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('20200115')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'SOME_VERSION']) {
      const valueOrError = ApiVersion.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })

  it('should tell if the version is supported for registration', () => {
    const version = ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue()

    expect(version.isSupportedForRegistration()).toBeTruthy()

    const version2 = ApiVersion.create(ApiVersion.VERSIONS.v20240226).getValue()

    expect(version2.isSupportedForRegistration()).toBeTruthy()

    const version3 = ApiVersion.create(ApiVersion.VERSIONS.v20161215).getValue()

    expect(version3.isSupportedForRegistration()).toBeFalsy()
  })

  it('should tell if the version is supported for recovery sign in', () => {
    const version = ApiVersion.create(ApiVersion.VERSIONS.v20200115).getValue()

    expect(version.isSupportedForRecoverySignIn()).toBeTruthy()

    const version2 = ApiVersion.create(ApiVersion.VERSIONS.v20240226).getValue()

    expect(version2.isSupportedForRecoverySignIn()).toBeTruthy()

    const version3 = ApiVersion.create(ApiVersion.VERSIONS.v20161215).getValue()

    expect(version3.isSupportedForRecoverySignIn()).toBeFalsy()
  })
})
