import type { Client } from '@grpc/grpc-js'

import { PromisifiedCall } from './PromisifiedCall'
import { OriginalCall } from './OriginalCall'

export type PromisifiedClient<C> = { $: C } & {
  [prop in Exclude<keyof C, keyof Client>]: C[prop] extends OriginalCall<infer T, infer U>
    ? PromisifiedCall<T, U>
    : never
}
