import { Result } from '../Core/Result'
import { ValueObject } from '../Core/ValueObject'
import { EncryptionVersionProps } from './EncryptionVersionProps'

export class EncryptionVersion extends ValueObject<EncryptionVersionProps> {
  static readonly VERSIONS = {
    Unencrypted: 0,
    Default: 1,
  }

  get value(): number {
    return this.props.value
  }

  private constructor(props: EncryptionVersionProps) {
    super(props)
  }

  static create(version: number): Result<EncryptionVersion> {
    if (
      isNaN(version) ||
      version === null ||
      version === undefined ||
      !Object.values(this.VERSIONS).includes(version)
    ) {
      return Result.fail<EncryptionVersion>(
        `Could not create EncryptionVersion. Version should be a number, given: ${version}`,
      )
    }

    return Result.ok<EncryptionVersion>(new EncryptionVersion({ value: version }))
  }
}
