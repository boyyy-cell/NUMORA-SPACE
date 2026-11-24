import React from 'react';
import { RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function BackendStatusBadge({ status, checkNow, baseUrl, error, compact = false }) {
  // Normalize status
  const normalizedStatus =
    status === 'connected' ? 'online' :
    status === 'disconnected' ? 'offline' :
    status === 'checking' ? 'connecting' :
    status;

  if (compact) {
    return (
      <button
        onClick={checkNow}
        title={`Backend: ${normalizedStatus.toUpperCase()} (${baseUrl}) ${error ? '- ' + error : ''}`}
        className="btn-interactive flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border-clean bg-pure-white shadow-subtle hover:border-forest transition-colors"
      >
        {normalizedStatus === 'online' && (
          <>
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span className="text-charcoal text-[11px] font-medium">Online</span>
          </>
        )}
        {normalizedStatus === 'connecting' && (
          <>
            <RefreshCw className="w-3 h-3 text-forest animate-spin" />
            <span className="text-secondary-text text-[11px]">Connecting...</span>
          </>
        )}
        {normalizedStatus === 'offline' && (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-rose-700 text-[11px] font-medium">Offline</span>
          </>
        )}
        {normalizedStatus === 'request_failed' && (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-700 text-[11px] font-medium">Req Failed</span>
          </>
        )}
        {normalizedStatus === 'unauthorized' && (
          <>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-purple-700 text-[11px] font-medium">Unauthorized</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border-clean bg-pure-white shadow-subtle text-xs">
      <div className="flex items-center gap-2.5">
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

        <div>
          <div className="font-semibold text-charcoal flex items-center gap-1.5">
            {normalizedStatus === 'online' && <span>Backend Online</span>}
            {normalizedStatus === 'connecting' && <span className="text-secondary-text">Connecting...</span>}
            {normalizedStatus === 'offline' && <span className="text-rose-700">Backend Offline</span>}
            {normalizedStatus === 'request_failed' && <span className="text-amber-700">Request Failed</span>}
            {normalizedStatus === 'unauthorized' && <span className="text-purple-700">Unauthorized (401/403)</span>}
          </div>
          <p className="text-[11px] text-secondary-text truncate max-w-[200px] sm:max-w-xs">
            {normalizedStatus === 'online' ? `FastAPI @ ${baseUrl}` : (error || `Target: ${baseUrl}`)}
          </p>
        </div>
      </div>

      <button
        onClick={checkNow}
        disabled={normalizedStatus === 'connecting'}
        className="btn-interactive p-1.5 rounded-lg hover:bg-ivory text-secondary-text hover:text-forest transition-colors"
        title="Periksa Ulang Status Backend"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${normalizedStatus === 'connecting' ? 'animate-spin text-forest' : ''}`} />
      </button>
    </div>
  );
}
