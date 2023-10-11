import * as OpenTelemetryApi from '@opentelemetry/api'

import { OpenTelemetryTracerInterface } from './OpenTelemetryTracerInterface'

export class OpenTelemetryTracer implements OpenTelemetryTracerInterface {
  private parentSpan: OpenTelemetryApi.Span | undefined
  private internalSpan: OpenTelemetryApi.Span | undefined

  startSpan(parentSpanName: string, internalSpanName: string, activeContext?: OpenTelemetryApi.Context): void {
    const tracer = OpenTelemetryApi.trace.getTracer(`${parentSpanName}-handler`)

    this.parentSpan = tracer.startSpan(parentSpanName, { kind: OpenTelemetryApi.SpanKind.CONSUMER }, activeContext)
    const ctx = OpenTelemetryApi.trace.setSpan(activeContext ?? OpenTelemetryApi.context.active(), this.parentSpan)

    this.internalSpan = tracer.startSpan(internalSpanName, { kind: OpenTelemetryApi.SpanKind.INTERNAL }, ctx)
  }

  stopSpan(): void {
    if (this.internalSpan) {
      this.internalSpan.end()
      this.internalSpan = undefined
    }

    if (this.parentSpan) {
      this.parentSpan.end()
      this.parentSpan = undefined
    }
  }

  stopSpanWithError(error: Error): void {
    if (this.internalSpan) {
      this.internalSpan.recordException(error)
      this.internalSpan.end()
      this.internalSpan = undefined
    }

    if (this.parentSpan) {
      this.parentSpan.end()
      this.parentSpan = undefined
    }
  }
}
