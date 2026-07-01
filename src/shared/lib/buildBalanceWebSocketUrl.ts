export const buildBalanceWebSocketUrl = (baseUrl: string | undefined, origin: string): string => {
  const resolvedApiBase = new URL(baseUrl || '/', `${origin}/`);
  const url = new URL('ws', `${resolvedApiBase.toString().replace(/\/+$/, '')}/`);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};
