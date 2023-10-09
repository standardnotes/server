import * as OpenTelemetrySDKNode from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray'
import * as AwsResourceDetectors from '@opentelemetry/resource-detector-aws'
import { TypeormInstrumentation } from 'opentelemetry-instrumentation-typeorm'
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'

import { OpenTelemetrySDKInterface } from './OpenTelemetrySDKInterface'

export class OpenTelemetrySDK implements OpenTelemetrySDKInterface {
  private declare sdk: OpenTelemetrySDKNode.NodeSDK

  constructor(private serviceName: string) {
    this.build()
  }

  build(): void {
    const otResource = OpenTelemetrySDKNode.resources.Resource.default().merge(
      new OpenTelemetrySDKNode.resources.Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
      }),
    )
    const traceExporter = new OTLPTraceExporter()
    const spanProcessor = new OpenTelemetrySDKNode.tracing.BatchSpanProcessor(traceExporter)
    const metricReader = new OpenTelemetrySDKNode.metrics.PeriodicExportingMetricReader({
      exportIntervalMillis: 1_000,
      exporter: new OTLPMetricExporter(),
    })

    const serviceName = this.serviceName
    const winstonInstrumentation = new WinstonInstrumentation({
      logHook: (_span, record) => {
        record['resource.service.name'] = serviceName
      },
    })

    this.sdk = new OpenTelemetrySDKNode.NodeSDK({
      sampler: new OpenTelemetrySDKNode.tracing.TraceIdRatioBasedSampler(0.01),
      textMapPropagator: new AWSXRayPropagator(),
      instrumentations: [
        new HttpInstrumentation(),
        new AwsInstrumentation({
          suppressInternalInstrumentation: true,
        }),
        new TypeormInstrumentation(),
        winstonInstrumentation,
        new IORedisInstrumentation(),
      ],
      metricReader: metricReader,
      resource: otResource,
      spanProcessor: spanProcessor,
      traceExporter: traceExporter,
      idGenerator: new AWSXRayIdGenerator(),
      autoDetectResources: true,
      resourceDetectors: [AwsResourceDetectors.awsEcsDetector],
    })
  }

  start(): void {
    this.sdk.start()
  }
}
