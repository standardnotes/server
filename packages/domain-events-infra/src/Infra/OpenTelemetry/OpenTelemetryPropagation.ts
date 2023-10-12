import * as OpenTelemetryApi from '@opentelemetry/api'

import { OpenTelemetryPropagationInterface } from './OpenTelemetryPropagationInterface'

export class OpenTelemetryPropagation implements OpenTelemetryPropagationInterface {
  inject(): Record<string, string> {
    const output = {}

    OpenTelemetryApi.propagation.inject(OpenTelemetryApi.context.active(), output)

    return output
  }

  extract(input: Record<string, string>): OpenTelemetryApi.Context {
    const activeContext = OpenTelemetryApi.propagation.extract(OpenTelemetryApi.context.active(), input)

    return activeContext
  }
}
