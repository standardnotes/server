import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../../../Bootstrap/Types'
import { OfflineSettingName } from '../../../Domain/Setting/OfflineSettingName'
import { OfflineSettingRepositoryInterface } from '../../../Domain/Setting/OfflineSettingRepositoryInterface'

@injectable()
export class OfflineUserAuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.Auth_OfflineSettingRepository) private offlineSettingRepository: OfflineSettingRepositoryInterface,
    @inject(TYPES.Auth_Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.headers['x-offline-token']) {
        this.logger.debug('OfflineUserAuthMiddleware missing x-offline-token header.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        })

        return
      }

      const offlineFeaturesTokenSetting = await this.offlineSettingRepository.findOneByNameAndValue(
        OfflineSettingName.FeaturesToken,
        request.headers['x-offline-token'] as string,
      )
      if (offlineFeaturesTokenSetting === null) {
        this.logger.debug('OfflineUserAuthMiddleware authentication failure.')

        response.status(401).send({
          error: {
            tag: 'invalid-auth',
            message: 'Invalid login credentials.',
          },
        })

        return
      }

      response.locals.offlineUserEmail = offlineFeaturesTokenSetting.email
      response.locals.offlineFeaturesToken = offlineFeaturesTokenSetting.value

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
