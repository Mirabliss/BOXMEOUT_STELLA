// ============================================================
// BOXMEOUT — WalletButton Component
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';

export function WalletButton(): JSX.Element {
  const { address, balance, isConnected, isConnecting, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="min-h-[44px] px-4 rounded-lg bg-amber-500 hover:bg-amber-400 font-semibold text-black text-sm disabled:opacity-50"
      >
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    );
  }

  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : '';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="min-h-[44px] px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-white flex items-center gap-2"
      >
        <span className="font-mono">{short}</span>
        {balance != null && <span className="text-gray-400 text-xs">{balance.toFixed(2)} XLM</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { navigator.clipboard.writeText(address ?? ''); setOpen(false); }}
            className="w-full min-h-[44px] px-4 text-left text-sm text-gray-300 hover:bg-gray-800"
          >
            Copy Address
          </button>
          <button
            onClick={() => { disconnect(); setOpen(false); }}
            className="w-full min-h-[44px] px-4 text-left text-sm text-red-400 hover:bg-gray-800"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
