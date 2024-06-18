import { Result, ValueObject } from '@standardnotes/domain-core'

import { ApiVersionProps } from './ApiVersionProps'

export class ApiVersion extends ValueObject<ApiVersionProps> {
  static readonly VERSIONS = {
    v20161215: '20161215',
    v20190520: '20190520',
    v20200115: '20200115',
    v20240226: '20240226',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: ApiVersionProps) {
    super(props)
  }

  static create(version: string): Result<ApiVersion> {
    const isValidVersion = Object.values(this.VERSIONS).includes(version)
    if (!isValidVersion) {
      return Result.fail(`Invalid api version: ${version}`)
    } else {
      return Result.ok(new ApiVersion({ value: version }))
    }
  }

  isSupportedForRegistration(): boolean {
    return [ApiVersion.VERSIONS.v20200115, ApiVersion.VERSIONS.v20240226].includes(this.props.value)
  }

  isSupportedForRecoverySignIn(): boolean {
    return [ApiVersion.VERSIONS.v20200115, ApiVersion.VERSIONS.v20240226].includes(this.props.value)
  }
}
