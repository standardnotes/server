import * as crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'

import TYPES from '../../../Bootstrap/Types'

@injectable()
export class AdminKeyMiddleware extends BaseMiddleware {
  constructor(@inject(TYPES.Auth_ADMIN_KEY) private adminKey: string) {
    super()
  }

  handler(request: Request, response: Response, next: NextFunction): void {
    const incomingKey = this.getIncomingKey(request)

    if (!this.isValidKey(incomingKey)) {
      response.status(404).send()

      return
    }

    next()
  }

  private getIncomingKey(request: Request): string | undefined {
    const headerKey = request.headers['x-admin-key']
    if (typeof headerKey === 'string' && headerKey.length > 0) {
      return headerKey
    }

    return undefined
  }

  private isValidKey(incomingKey: string | undefined): boolean {
    if (!this.adminKey) {
      return true
    }

    if (!incomingKey) {
      return false
    }

    const incomingKeyDigest = crypto.createHash('sha256').update(incomingKey).digest()
    const adminKeyDigest = crypto.createHash('sha256').update(this.adminKey).digest()

    return crypto.timingSafeEqual(incomingKeyDigest, adminKeyDigest)
  }
}
