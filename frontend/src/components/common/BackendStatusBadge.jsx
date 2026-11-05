import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function BackendStatusBadge({ status, checkNow, baseUrl, error, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={checkNow}
        title={`Backend: ${status} (${baseUrl}) ${error ? '- ' + error : ''}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-lavender/20 transition-colors glass-panel hover:border-orchid/40"
      >
        {status === 'connected' && (
          <>
            <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
            <span className="text-ivory/80 text-[11px]">API Active</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-rose-300 text-[11px]">API Offline</span>
          </>
        )}
        {status === 'checking' && (
          <>
            <RefreshCw className="w-3 h-3 text-orchid animate-spin" />
            <span className="text-orchid text-[11px]">Checking...</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-lavender/15 bg-aubergine/80 backdrop-blur-md text-xs">
      <div className="flex items-center gap-2.5">
        {status === 'connected' && (
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-sage" />
            <span className="absolute w-4 h-4 rounded-full bg-sage/30 animate-ping" />
          </div>
        )}
        {status === 'disconnected' && (
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        )}
        {status === 'checking' && (
          <RefreshCw className="w-3.5 h-3.5 text-orchid animate-spin" />
        )}

        <div>
          <div className="font-semibold text-ivory flex items-center gap-1.5">
            {status === 'connected' && <span>Backend Connected</span>}
            {status === 'disconnected' && <span className="text-rose-400">Backend Disconnected</span>}
            {status === 'checking' && <span className="text-orchid">Checking Connection...</span>}
          </div>
          <p className="text-[11px] text-lavender truncate max-w-[200px] sm:max-w-xs">
            {status === 'connected' ? `FastAPI @ ${baseUrl}` : (error || `Target: ${baseUrl}`)}
          </p>
        </div>
      </div>

      <button
        onClick={checkNow}
        disabled={status === 'checking'}
        className="p-1.5 rounded-lg hover:bg-white/5 text-lavender hover:text-orchid transition-colors"
        title="Periksa Ulang Status Backend"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin text-orchid' : ''}`} />
      </button>
    </div>
  );
}
