'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Wifi, WifiOff } from 'lucide-react';
import { fetchNetworkStatus } from '../../lib/api';

interface NetworkStatus {
  mode: 'LIVE' | 'SIMULATED';
  status: string;
  fabricAvailable: boolean;
  disclaimer: string;
  health: string;
  blockHeight: number;
}

export function NetworkModeBanner() {
  const [status, setStatus] = useState<NetworkStatus | null>(null);

  useEffect(() => {
    fetchNetworkStatus().then((s) => {
      if (s) setStatus(s);
    });
  }, []);

  if (!status) return null;

  const isSimulated = status.mode === 'SIMULATED' || !status.fabricAvailable;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Blockchain network mode: ${isSimulated ? 'Demo/Simulated' : 'Connected/Live'}`}
      className={`flex items-center gap-3 rounded-xl border p-3 text-xs ${
        isSimulated
          ? 'border-pending/40 bg-pending/5'
          : 'border-verified/30 bg-verified/5'
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isSimulated ? 'bg-pending text-white' : 'bg-verified text-white'
        }`}
        aria-hidden="true"
      >
        {isSimulated ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
              isSimulated
                ? 'border-pending/40 bg-pending/20 text-pending'
                : 'border-verified/30 bg-verified/20 text-verified'
            }`}
          >
            {isSimulated ? (
              <>
                <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                DEMO / SIMULATED
              </>
            ) : (
              <>
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
                CONNECTED / LIVE
              </>
            )}
          </span>
          <span className="font-mono text-[10px] text-muted">
            Block Height: {status.blockHeight}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted leading-tight truncate" title={status.disclaimer}>
          {isSimulated
            ? 'No real Hyperledger Fabric network is connected. Transaction IDs are locally generated hashes — NOT submitted to any blockchain.'
            : 'Transactions are being submitted to the Hyperledger Fabric network.'}
        </p>
      </div>
    </div>
  );
}
