import type { ServiceError, CallOptions, ClientUnaryCall, Metadata } from '@grpc/grpc-js'

export type OriginalCall<T, U> = (
  request: T,
  metadata: Metadata,
  options: Partial<CallOptions>,
  callback: (err: ServiceError | null, res?: U) => void,
) => ClientUnaryCall
