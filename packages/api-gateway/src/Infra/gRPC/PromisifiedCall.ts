import type { CallOptions, Metadata } from '@grpc/grpc-js'

export type PromisifiedCall<T, U> = (request: T, metadata?: Metadata, options?: Partial<CallOptions>) => Promise<U>
