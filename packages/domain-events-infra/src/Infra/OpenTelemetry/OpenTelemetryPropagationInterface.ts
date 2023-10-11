import { Context } from '@opentelemetry/api'

export interface OpenTelemetryPropagationInterface {
  inject(): { traceparent?: string; tracestate?: string }
  extract(input: { traceparent?: string; tracestate?: string }): Context
}
