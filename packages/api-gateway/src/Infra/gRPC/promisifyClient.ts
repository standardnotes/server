/**
 * https://github.com/timostamm/protobuf-ts/discussions/345
 */
import type { Client } from '@grpc/grpc-js'

import { PromisifiedClient } from './PromisifiedClient'

export function promisifyClient<C extends Client>(client: C) {
  return new Proxy(client, {
    get: (target, descriptor) => {
      const key = descriptor as keyof PromisifiedClient<C>

      if (key === '$') {
        return target
      }

      const func = target[key]
      if (typeof func === 'function') {
        return (...args: unknown[]) =>
          new Promise((resolve, reject) =>
            func.call(target, ...[...args, (err: unknown, res: unknown) => (err ? reject(err) : resolve(res))]),
          )
      }

      return undefined
    },
  }) as unknown as PromisifiedClient<C>
}
