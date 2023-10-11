import { Context } from '@opentelemetry/api'

export interface OpenTelemetryTracerInterface {
  startSpan(parentSpanName: string, internalSpanName: string, activeContext?: Context): void
  stopSpan(): void
  stopSpanWithError(error: Error): void
}
