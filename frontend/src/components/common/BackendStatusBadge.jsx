import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function BackendStatusBadge({ status, checkNow, baseUrl, error, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={checkNow}
        title={`Backend: ${status} (${baseUrl}) ${error ? '- ' + error : ''}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border-clean bg-pure-white shadow-subtle hover:border-forest transition-colors"
      >
        {status === 'connected' && (
          <>
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span className="text-charcoal text-[11px] font-medium">API Aktif</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-rose-700 text-[11px] font-medium">API Offline</span>
          </>
        )}
        {status === 'checking' && (
          <>
            <RefreshCw className="w-3 h-3 text-forest animate-spin" />
            <span className="text-secondary-text text-[11px]">Memeriksa...</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border-clean bg-pure-white shadow-subtle text-xs">
      <div className="flex items-center gap-2.5">
        {status === 'connected' && (
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-forest" />
            <span className="absolute w-4 h-4 rounded-full bg-forest/20 animate-ping" />
          </div>
        )}
        {status === 'disconnected' && (
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
        )}
        {status === 'checking' && (
          <RefreshCw className="w-3.5 h-3.5 text-forest animate-spin" />
        )}

        <div>
          <div className="font-semibold text-charcoal flex items-center gap-1.5">
            {status === 'connected' && <span>Backend Terhubung</span>}
            {status === 'disconnected' && <span className="text-rose-700">Backend Terputus</span>}
            {status === 'checking' && <span className="text-secondary-text">Memeriksa Koneksi...</span>}
          </div>
          <p className="text-[11px] text-secondary-text truncate max-w-[200px] sm:max-w-xs">
            {status === 'connected' ? `FastAPI @ ${baseUrl}` : (error || `Target: ${baseUrl}`)}
          </p>
        </div>
      </div>

      <button
        onClick={checkNow}
        disabled={status === 'checking'}
        className="p-1.5 rounded-lg hover:bg-ivory text-secondary-text hover:text-forest transition-colors"
        title="Periksa Ulang Status Backend"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin text-forest' : ''}`} />
      </button>
    </div>
  );
}
