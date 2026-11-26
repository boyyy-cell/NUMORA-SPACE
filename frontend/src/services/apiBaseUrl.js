export const PRODUCTION_API_URL = 'https://numora-space-api.vercel.app';

const isLoopbackHost = (hostname) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const isPrivateLanHost = (hostname) =>
  /^192\.168\.\d{1,3}\.\d{1,3}$|^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);

function parseConfiguredUrl(envUrl) {
  if (!envUrl || !envUrl.trim()) return null;

  const parsed = new URL(envUrl.trim());
  if (parsed.pathname.replace(/\/+$/, '') === '/api/v1') {
    parsed.pathname = '';
  }
  parsed.search = '';
  parsed.hash = '';
  return parsed;
}

export function resolveApiBaseUrl(envUrl, location) {
  const configuredUrl = parseConfiguredUrl(envUrl);
  const configuredBase = configuredUrl ? configuredUrl.toString().replace(/\/+$/, '') : '';
  const hostname = location?.hostname;
  const protocol = location?.protocol || 'http:';

  const port = configuredUrl?.port || '8000';

  if (isLoopbackHost(hostname)) {
    if (configuredUrl && isLoopbackHost(configuredUrl.hostname)) return configuredBase;
    return `${protocol}//127.0.0.1:${port}`;
  }

  if (isPrivateLanHost(hostname)) {
    if (configuredUrl && isPrivateLanHost(configuredUrl.hostname)) return configuredBase;
    return `${protocol}//${hostname}:${port}`;
  }

  if (configuredUrl && !isLoopbackHost(configuredUrl.hostname) && !isPrivateLanHost(configuredUrl.hostname)) {
    return configuredBase;
  }
  if (!hostname) return configuredBase || PRODUCTION_API_URL;

  return PRODUCTION_API_URL;
}
