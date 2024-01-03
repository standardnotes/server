import * as OpenTelemetrySDKNode from '@opentelemetry/sdk-node'
import { SemanticAttributes, SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
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
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc'
import { IncomingMessage } from 'http'
import { Attributes } from '@opentelemetry/api'

import { OpenTelemetrySDKInterface } from './OpenTelemetrySDKInterface'

export class OpenTelemetrySDK implements OpenTelemetrySDKInterface {
  private declare sdk: OpenTelemetrySDKNode.NodeSDK

  constructor(
    private options: {
      serviceName: string
      spanRatio?: number
      metricExportIntervalMillis?: number
    },
  ) {
    this.build()
  }

  build(): void {
    const otResource = OpenTelemetrySDKNode.resources.Resource.default().merge(
      new OpenTelemetrySDKNode.resources.Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.options.serviceName,
      }),
    )

    const traceExporter = new OTLPTraceExporter()

    const spanProcessor = new OpenTelemetrySDKNode.tracing.BatchSpanProcessor(traceExporter)

    const metricExportIntervalMillis = this.options.metricExportIntervalMillis ?? 300_000
    const metricReader = new OpenTelemetrySDKNode.metrics.PeriodicExportingMetricReader({
      exportIntervalMillis: metricExportIntervalMillis,
      exporter: new OTLPMetricExporter(),
    })

    const serviceName = this.options.serviceName
    const winstonInstrumentation = new WinstonInstrumentation({
      logHook: (_span, record) => {
        record['resource.service.name'] = serviceName
      },
    })

    const ratio = this.options.spanRatio ?? 0.1

    this.sdk = new OpenTelemetrySDKNode.NodeSDK({
      sampler: new OpenTelemetrySDKNode.tracing.TraceIdRatioBasedSampler(ratio),
      textMapPropagator: new AWSXRayPropagator(),
      instrumentations: [
        new HttpInstrumentation({
          ignoreIncomingRequestHook: (request) => {
            const isHealthCheckUrl = !!request.url?.match(/\/healthcheck/)

            return isHealthCheckUrl
          },
          startIncomingSpanHook: (_request: IncomingMessage): Attributes => {
            return {
              [SemanticAttributes.HTTP_CLIENT_IP]: undefined,
            }
          },
        }),
        new ExpressInstrumentation(),
        new AwsInstrumentation({
          suppressInternalInstrumentation: true,
          sqsExtractContextPropagationFromPayload: true,
        }),
        new TypeormInstrumentation({
          collectParameters: false,
          suppressInternalInstrumentation: true,
        }),
        winstonInstrumentation,
        new IORedisInstrumentation(),
        new GrpcInstrumentation(),
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

  async shutdown(): Promise<void> {
    await this.sdk.shutdown()
  }
}
