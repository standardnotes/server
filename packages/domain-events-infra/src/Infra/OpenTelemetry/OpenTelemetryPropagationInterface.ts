import { Context } from '@opentelemetry/api'

export interface OpenTelemetryPropagationInterface {
  inject(): Record<string, string>
  extract(input: Record<string, string>): Context
}
