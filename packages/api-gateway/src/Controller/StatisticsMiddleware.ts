import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { Logger } from 'winston'
import { StatisticsStoreInterface } from '@standardnotes/analytics'

import TYPES from '../Bootstrap/Types'

@injectable()
export class StatisticsMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.StatisticsStore) private statisticsStore: StatisticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  async handler(request: Request, _response: Response, next: NextFunction): Promise<void> {
    try {
      const snjsVersion = request.headers['x-snjs-version'] ?? 'unknown'
      await this.statisticsStore.incrementSNJSVersionUsage(snjsVersion as string)

      const applicationVersion = request.headers['x-application-version'] ?? 'unknown'
      await this.statisticsStore.incrementApplicationVersionUsage(applicationVersion as string)
    } catch (error) {
      this.logger.error(`Could not store analytics data: ${(error as Error).message}`)
    }

    return next()
  }
}
