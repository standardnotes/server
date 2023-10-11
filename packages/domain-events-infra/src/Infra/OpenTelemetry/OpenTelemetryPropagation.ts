import * as OpenTelemetryApi from '@opentelemetry/api'

export class OpenTelemetryPropagation {
  inject(): { traceparent?: string; tracestate?: string } {
    const output = {}

    OpenTelemetryApi.propagation.inject(OpenTelemetryApi.context.active(), output)

    return output as { traceparent?: string; tracestate?: string }
  }

  extract(input: { traceparent?: string; tracestate?: string }): OpenTelemetryApi.Context {
    const activeContext = OpenTelemetryApi.propagation.extract(OpenTelemetryApi.context.active(), input)

    return activeContext
  }
}
