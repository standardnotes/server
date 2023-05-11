import { ValueObject } from '../Core/ValueObject'
import { Result } from '../Core/Result'
import { ServiceIdentifierProps } from './ServiceIdentifierProps'

export class ServiceIdentifier extends ValueObject<ServiceIdentifierProps> {
  static readonly NAMES = {
    ApiGateway: 'ApiGateway',
    Auth: 'Auth',
    SyncingServer: 'SyncingServer',
    Revisions: 'Revisions',
  }

  get value(): string {
    return this.props.value
  }

  private constructor(props: ServiceIdentifierProps) {
    super(props)
  }

  static create(name: string): Result<ServiceIdentifier> {
    const isValidName = Object.values(this.NAMES).includes(name)
    if (!isValidName) {
      return Result.fail<ServiceIdentifier>(`Invalid subscription plan name: ${name}`)
    } else {
      return Result.ok<ServiceIdentifier>(new ServiceIdentifier({ value: name }))
    }
  }
}
