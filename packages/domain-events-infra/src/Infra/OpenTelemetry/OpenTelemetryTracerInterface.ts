export interface OpenTelemetryTracerInterface {
  startSpan(parentSpanName: string, internalSpanName: string): void
  stopSpan(): void
  stopSpanWithError(error: Error): void
}
