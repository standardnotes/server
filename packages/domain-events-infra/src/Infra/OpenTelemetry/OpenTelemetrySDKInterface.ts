export interface OpenTelemetrySDKInterface {
  start(): void
  shutdown(): Promise<void>
}
