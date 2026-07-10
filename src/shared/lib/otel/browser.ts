import { context, propagation, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const FRONTEND_TRACER_NAME = 'letovo-frontend';
const DEFAULT_EXPORTER_URL = '/otel/v1/traces';
const URL_ATTRIBUTE_KEYS = ['url.full', 'http.url'];

let initialized = false;

type SpanAttributes = Record<string, string | number | boolean | undefined>;

const isBrowser = (): boolean => typeof window !== 'undefined';

const isTelemetryEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true' && isBrowser();

const exporterUrl = (): string =>
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || DEFAULT_EXPORTER_URL;

const samplerRatio = (): number => {
  const parsed = Number(process.env.NEXT_PUBLIC_OTEL_TRACES_SAMPLER_RATIO || '0.1');
  if (!Number.isFinite(parsed)) {
    return 0.1;
  }
  return Math.min(1, Math.max(0, parsed));
};

const absoluteUrl = (value: string): string => new URL(value, window.location.origin).toString();

const urlWithoutQuery = (value: string): string => {
  const url = new URL(value, window.location.origin);
  url.search = '';
  url.hash = '';
  url.username = '';
  url.password = '';
  return url.toString();
};

const setSanitizedUrlAttributes = (span: Span, rawUrl: string): void => {
  const sanitized = urlWithoutQuery(rawUrl);

  for (const key of URL_ATTRIBUTE_KEYS) {
    span.setAttribute(key, sanitized);
  }
};

const collectorIgnoreUrls = (): Array<string | RegExp> => {
  const absoluteCollectorUrl = absoluteUrl(exporterUrl());
  const collectorPath = new URL(absoluteCollectorUrl).pathname;

  return [
    absoluteCollectorUrl,
    new RegExp(`^${absoluteCollectorUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
    new RegExp(`${collectorPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
  ];
};

const propagationTargets = (): Array<string | RegExp> => {
  const targets: Array<string | RegExp> = [/^\//];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (baseUrl) {
    targets.push(new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }

  return targets;
};

const setTraceHeader = (config: InternalAxiosRequestConfig, traceparent: string): void => {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  config.headers.set('traceparent', traceparent);
};

export const initBrowserTelemetry = (): void => {
  if (!isTelemetryEnabled() || initialized) {
    return;
  }

  const collectorUrl = exporterUrl();
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'letovo-frontend',
      [ATTR_SERVICE_NAMESPACE]: process.env.NEXT_PUBLIC_OTEL_SERVICE_NAMESPACE || 'letovocorp',
      'deployment.environment': process.env.NEXT_PUBLIC_OTEL_DEPLOYMENT_ENVIRONMENT || 'production',
      [ATTR_SERVICE_VERSION]: process.env.NEXT_PUBLIC_LETOVO_BUILD_SHA || 'development',
    }),
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(samplerRatio()),
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: collectorUrl,
        }),
      ),
    ],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation({
        applyCustomAttributesOnSpan: {
          documentLoad: span => setSanitizedUrlAttributes(span, window.location.href),
          documentFetch: span => setSanitizedUrlAttributes(span, window.location.href),
          resourceFetch: (span, resource) => setSanitizedUrlAttributes(span, resource.name),
        },
      }),
      new FetchInstrumentation({
        ignoreUrls: collectorIgnoreUrls(),
        applyCustomAttributesOnSpan: (span, _request, result) =>
          setSanitizedUrlAttributes(span, 'url' in result ? result.url : window.location.href),
        propagateTraceHeaderCorsUrls: propagationTargets(),
      }),
      new XMLHttpRequestInstrumentation({
        ignoreUrls: collectorIgnoreUrls(),
        applyCustomAttributesOnSpan: (span, xhr) =>
          setSanitizedUrlAttributes(span, xhr.responseURL || window.location.href),
        propagateTraceHeaderCorsUrls: propagationTargets(),
      }),
    ],
  });

  initialized = true;
};

export const attachAxiosTelemetry = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!isTelemetryEnabled() || !initialized) {
      return config;
    }

    const carrier: Record<string, string> = {};
    propagation.inject(context.active(), carrier);

    if (carrier.traceparent) {
      setTraceHeader(config, carrier.traceparent);
    }

    return config;
  });
};

export const withFrontendSpan = async <T>(
  name: string,
  attributes: SpanAttributes,
  operation: () => Promise<T>,
): Promise<T> => {
  if (!isTelemetryEnabled() || !initialized) {
    return operation();
  }

  const tracer = trace.getTracer(FRONTEND_TRACER_NAME);
  const span = tracer.startSpan(name, {
    attributes,
  });

  try {
    return await context.with(trace.setSpan(context.active(), span), operation);
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    span.end();
  }
};
