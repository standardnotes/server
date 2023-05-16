import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { ApiVersion } from '../Api/ApiVersion'
import { AuthResponseFactory20161215 } from './AuthResponseFactory20161215'
import { AuthResponseFactory20190520 } from './AuthResponseFactory20190520'
import { AuthResponseFactory20200115 } from './AuthResponseFactory20200115'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'
import { AuthResponseFactoryResolverInterface } from './AuthResponseFactoryResolverInterface'

@injectable()
export class AuthResponseFactoryResolver implements AuthResponseFactoryResolverInterface {
  constructor(
    @inject(TYPES.Auth_AuthResponseFactory20161215) private authResponseFactory20161215: AuthResponseFactory20161215,
    @inject(TYPES.Auth_AuthResponseFactory20190520) private authResponseFactory20190520: AuthResponseFactory20190520,
    @inject(TYPES.Auth_AuthResponseFactory20200115) private authResponseFactory20200115: AuthResponseFactory20200115,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {}

  resolveAuthResponseFactoryVersion(apiVersion: string): AuthResponseFactoryInterface {
    this.logger.debug(`Resolving auth response factory for api version: ${apiVersion}`)

    switch (apiVersion) {
      case ApiVersion.v20190520:
        return this.authResponseFactory20190520
      case ApiVersion.v20200115:
        return this.authResponseFactory20200115
      default:
        return this.authResponseFactory20161215
    }
  }
}
