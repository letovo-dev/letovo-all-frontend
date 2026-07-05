import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const assertContains = (path, expected) => {
  const content = read(path);

  if (!content.includes(expected)) {
    throw new Error(`${path} must contain ${expected}`);
  }
};

assertContains('package.json', '"@opentelemetry/api": "^1.9.1"');
assertContains('package.json', '"@opentelemetry/sdk-trace-web": "^2.9.0"');
assertContains('package.json', '"@opentelemetry/exporter-trace-otlp-http": "^0.220.0"');
assertContains('package.json', '"@opentelemetry/instrumentation-xml-http-request": "^0.220.0"');
assertContains('src/shared/lib/ApiSPA/axios/axios.ts', 'attachAxiosTelemetry(instance)');
assertContains('src/shared/lib/otel/browser.ts', 'WebTracerProvider');
assertContains('src/shared/lib/otel/browser.ts', 'OTLPTraceExporter');
assertContains('src/shared/lib/otel/browser.ts', 'DocumentLoadInstrumentation');
assertContains('src/shared/lib/otel/browser.ts', 'XMLHttpRequestInstrumentation');
assertContains('src/shared/lib/otel/browser.ts', 'propagation.inject');
assertContains('src/shared/lib/otel/browser.ts', 'traceparent');
assertContains('src/shared/lib/otel/browser.ts', 'NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT');
assertContains('src/shared/lib/otel/TelemetryBootstrap.tsx', 'initBrowserTelemetry');
assertContains('src/app/layout.tsx', '<TelemetryBootstrap />');
assertContains('src/shared/hooks/useActivityAnalytics.ts', "'analytics.activity_ping'");
assertContains('dockerfile', 'ARG NEXT_PUBLIC_OTEL_ENABLED=');
assertContains('dockerfile', 'ARG NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=');
