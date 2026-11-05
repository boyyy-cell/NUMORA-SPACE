import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function BackendStatusBadge({ status, checkNow, baseUrl, error, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={checkNow}
        title={`Backend: ${status} (${baseUrl}) ${error ? '- ' + error : ''}`}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors glass-panel"
      >
        {status === 'connected' && (
          <>
            <span className="w-2 h-2 rounded-full bg-numora-success animate-pulse" />
            <span className="text-numora-white/80">API Active</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <span className="w-2 h-2 rounded-full bg-numora-error" />
            <span className="text-numora-error">API Offline</span>
          </>
        )}
        {status === 'checking' && (
          <>
            <RefreshCw className="w-3 h-3 text-numora-cyan animate-spin" />
            <span className="text-numora-cyan">Checking...</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-numora-surface/70 backdrop-blur-md text-xs">
      <div className="flex items-center gap-2.5">
        {status === 'connected' && (
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-numora-success" />
            <span className="absolute w-4 h-4 rounded-full bg-numora-success/30 animate-ping" />
          </div>
        )}
        {status === 'disconnected' && (
          <div className="w-2.5 h-2.5 rounded-full bg-numora-error" />
        )}
        {status === 'checking' && (
          <RefreshCw className="w-3.5 h-3.5 text-numora-cyan animate-spin" />
        )}

        <div>
          <div className="font-semibold text-numora-white flex items-center gap-1.5">
            {status === 'connected' && <span>Backend Connected</span>}
            {status === 'disconnected' && <span className="text-numora-error">Backend Disconnected</span>}
            {status === 'checking' && <span className="text-numora-cyan">Checking Connection...</span>}
          </div>
          <p className="text-[11px] text-numora-muted truncate max-w-[200px] sm:max-w-xs">
            {status === 'connected' ? `FastAPI @ ${baseUrl}` : (error || `Target: ${baseUrl}`)}
          </p>
        </div>
      </div>

      <button
        onClick={checkNow}
        disabled={status === 'checking'}
        className="p-1.5 rounded-lg hover:bg-white/5 text-numora-muted hover:text-numora-cyan transition-colors"
        title="Periksa Ulang Status Backend"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin text-numora-cyan' : ''}`} />
      </button>
    </div>
  );
}

