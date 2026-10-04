'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudSyncModal({ isOpen, onClose }: CloudSyncModalProps) {
  const [supabaseUrl, setSupabaseUrl] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('plv_supabase_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      : process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('plv_supabase_key') || '' : ''
  );
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('plv_supabase_url', supabaseUrl);
      localStorage.setItem('plv_supabase_key', supabaseKey);
    }
    setStatus('Konfigurasi tersimpan lokal.');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setStatus('Isi URL dan API Key terlebih dahulu.');
      return;
    }
    setLoading(true);
    setStatus('Menghubungkan ke Supabase...');

    try {
      const client = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await client.from('rate_card_items').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setStatus(`Tersambung sukses! (Tabel rate_card_items terdeteksi)`);
    } catch (err: any) {
      setStatus(`Gagal terhubung: ${err.message || 'Periksa URL / Key'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('plv_supabase_url');
      localStorage.removeItem('plv_supabase_key');
    }
    setSupabaseUrl('');
    setSupabaseKey('');
    setStatus('Koneksi diputus & cache dihapus.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-strong rounded-xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[20px]">database</span>
            <h3 className="font-semibold text-sm text-white">Konfigurasi Cloud Supabase</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} autoComplete="on" className="flex flex-col gap-3 text-xs">
          <div>
            <label htmlFor="sbUrl" className="text-text-muted text-[11px] block">Project URL Supabase:</label>
            <input
              type="text"
              id="sbUrl"
              name="supabase_url"
              autoComplete="username"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="mt-1 w-full bg-surface-elevated border border-border-subtle rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-border-strong"
              placeholder="https://xyz.supabase.co"
              required
            />
          </div>
          <div>
            <label htmlFor="sbKey" className="text-text-muted text-[11px] block">Anon / Public API Key:</label>
            <input
              type="password"
              id="sbKey"
              name="supabase_key"
              autoComplete="current-password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="mt-1 w-full bg-surface-elevated border border-border-subtle rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-border-strong"
              placeholder="eyJhbGciOi..."
              required
            />
          </div>

          {status && (
            <div className="p-2 rounded bg-surface-elevated border border-border-subtle text-[11px] text-accent-blue font-mono">
              {status}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-1.5 rounded bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-accent-rose"
            >
              Putus Cloud
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={loading}
                className="px-3 py-1.5 rounded bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-xs text-text-subtle hover:text-white"
              >
                {loading ? 'Menguji...' : 'Uji Koneksi'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-accent-blue text-black font-semibold text-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
