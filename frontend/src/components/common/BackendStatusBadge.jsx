import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function BackendStatusBadge({ status, checkNow, baseUrl, error, compact = false }) {
  // Normalize status
  const normalizedStatus =
    status === 'connected' ? 'online' :
    status === 'disconnected' ? 'offline' :
    status === 'checking' ? 'connecting' :
    status;

  const getEnvironmentLabel = (url) => {
    if (!url) return 'Production';
    if (url.includes('localhost') || url.includes('127.0.0.1')) return 'Localhost';
    if (/^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))/.test(url)) return 'LAN Network';
    return 'Production';
  };

  const envLabel = getEnvironmentLabel(baseUrl);

  if (compact) {
    return (
      <button
        onClick={checkNow}
        title={`Backend: ${normalizedStatus.toUpperCase()} (FastAPI · ${envLabel}) ${error ? '- ' + error : ''}`}
        className="btn-interactive flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border-clean bg-pure-white shadow-subtle hover:border-forest transition-colors shrink-0 max-w-full"
      >
        {normalizedStatus === 'online' && (
          <>
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse shrink-0" />
            <span className="text-charcoal text-[11px] font-medium truncate">Online</span>
          </>
        )}
        {normalizedStatus === 'connecting' && (
          <>
            <RefreshCw className="w-3 h-3 text-forest animate-spin shrink-0" />
            <span className="text-secondary-text text-[11px] truncate">Connecting...</span>
          </>
        )}
        {normalizedStatus === 'offline' && (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-rose-700 text-[11px] font-medium truncate">Offline</span>
          </>
        )}
        {normalizedStatus === 'request_failed' && (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-amber-700 text-[11px] font-medium truncate">Req Failed</span>
          </>
        )}
        {normalizedStatus === 'unauthorized' && (
          <>
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
            <span className="text-purple-700 text-[11px] font-medium truncate">Unauthorized</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl border border-border-clean bg-pure-white shadow-subtle text-xs min-w-0 w-full"
      title={baseUrl ? `Endpoint: ${baseUrl}` : undefined}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="shrink-0 flex items-center justify-center">
          {normalizedStatus === 'online' && (
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-forest" />
              <span className="absolute w-4 h-4 rounded-full bg-forest/20 animate-ping" />
            </div>
          )}
          {normalizedStatus === 'connecting' && (
            <RefreshCw className="w-3.5 h-3.5 text-forest animate-spin" />
          )}
          {normalizedStatus === 'offline' && (
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          )}
          {normalizedStatus === 'request_failed' && (
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          )}
          {normalizedStatus === 'unauthorized' && (
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          )}
        </div>

        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-semibold text-charcoal flex items-center gap-1.5 truncate">
            {normalizedStatus === 'online' && <span>Backend Online</span>}
            {normalizedStatus === 'connecting' && <span className="text-secondary-text">Connecting...</span>}
            {normalizedStatus === 'offline' && <span className="text-rose-700">Backend Offline</span>}
            {normalizedStatus === 'request_failed' && <span className="text-amber-700">Request Failed</span>}
            {normalizedStatus === 'unauthorized' && <span className="text-purple-700">Unauthorized</span>}
          </div>
          <p className="text-[11px] text-secondary-text truncate mt-0.5">
            {normalizedStatus === 'online'
              ? `FastAPI · ${envLabel}`
              : (error || 'Layanan terputus')}
          </p>
        </div>
      </div>

      <button
        onClick={checkNow}
        disabled={normalizedStatus === 'connecting'}
        className="btn-interactive shrink-0 p-1.5 rounded-lg hover:bg-ivory text-secondary-text hover:text-forest transition-colors"
        title="Periksa Ulang Status Backend"
        aria-label="Periksa Ulang Status Backend"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${normalizedStatus === 'connecting' ? 'animate-spin text-forest' : ''}`} />
      </button>
    </div>
  );
}
