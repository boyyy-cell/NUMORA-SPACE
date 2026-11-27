import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { renderAsync } from 'docx-preview';

export default function InterviewDocumentPreview() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileDetails, setFileDetails] = useState({
    name: 'Wawancara_Lengkap_NUMORA_SPACE_S001_S002.docx',
    sizeFormatted: '35.2 KB',
    path: '/documents/Wawancara_Lengkap_NUMORA_SPACE_S001_S002.docx'
  });

  const loadDocument = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(fileDetails.path, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Gagal mengunduh berkas pratinjau (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Berkas dokumen kosong atau tidak terbaca');
      }

      // Update actual file size from blob
      const sizeKB = (blob.size / 1024).toFixed(1);
      setFileDetails(prev => ({
        ...prev,
        sizeFormatted: `${sizeKB} KB`
      }));

      if (containerRef.current) {
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Render docx directly to DOM container
        await renderAsync(blob, containerRef.current, null, {
          className: 'numora-docx-document',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          experimental: true,
          trimXmlDeclaration: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error rendering docx preview:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat pratinjau dokumen.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, []);

  return (
    <div className="space-y-6 animate-fade-page">
      {/* 1. Header & Ringkasan Dokumen Wawancara */}
      <div className="bg-pure-white rounded-2xl p-6 sm:p-7 border border-[#28332C]/14 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage/20 text-xs font-semibold text-forest">
              <FileText className="w-3.5 h-3.5" />
              <span>Dokumen Riset Kualitatif Resmi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
              Dokumentasi Wawancara Penelitian
            </h2>
            <p className="text-xs sm:text-sm text-secondary-text max-w-3xl leading-relaxed">
              Dokumentasi lengkap hasil wawancara mendalam dengan subjek penelitian <strong>S-001</strong> (Kelompok Kontrol · Pembelajaran Langsung Tatap Muka) dan <strong>S-002</strong> (Kelompok Eksperimen · Pembelajaran Berbantuan Platform NUMORA Space & NORA AI).
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-ivory text-forest border border-[#28332C]/12 font-semibold">
              Berkas: {fileDetails.name}
            </span>
            <span className="text-[10px] text-secondary-text flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Arsip Asli Penelitian (P-001)</span>
            </span>
          </div>
        </div>

        {/* Action Bar & Metadata Dokumen */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text">
            <span className="px-2.5 py-1 rounded-lg bg-ivory border border-[#28332C]/10 font-mono font-medium">
              Format: <strong>Microsoft Word (.docx)</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-ivory border border-[#28332C]/10 font-mono font-medium">
              Ukuran: <strong>{fileDetails.sizeFormatted}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-ivory border border-[#28332C]/10 font-medium text-forest flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Integritas Terverifikasi</span>
            </span>
          </div>

          {/* Tombol Utama Unduh DOCX */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadDocument}
              disabled={loading}
              className="btn-interactive p-2.5 rounded-xl border border-[#28332C]/14 text-secondary-text hover:text-charcoal hover:bg-ivory transition"
              title="Muat Ulang Pratinjau"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-forest' : ''}`} />
            </button>

            <a
              href={fileDetails.path}
              download={fileDetails.name}
              className="btn-interactive inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-pure-white font-semibold text-xs sm:text-sm hover:bg-forest/90 shadow-subtle transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Dokumen Word (.docx)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Panel Pratinjau Dokumen Word Langsung */}
      <div className="bg-pure-white rounded-2xl p-4 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-[#28332C]/12 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-forest" />
            <h3 className="font-bold text-charcoal text-sm">
              Pratinjau Interaktif Dokumen Asli
            </h3>
          </div>
          <span className="text-[11px] text-secondary-text font-mono">
            {fileDetails.name}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-9 h-9 border-3 border-forest/30 border-t-forest rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-charcoal">
                Membaca dan menyusun pratinjau berkas Word (.docx)...
              </p>
              <p className="text-[11px] text-secondary-text">
                Menyajikan struktur teks, tabel komparasi, dan format dokumen asli secara langsung.
              </p>
            </div>
          </div>
        )}

        {/* Error Fallback State */}
        {error && !loading && (
          <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Kendala Memuat Pratinjau Dokumen</span>
            </div>
            <p className="leading-relaxed">
              {error}. Anda tetap dapat mengunduh berkas Word asli secara langsung melalui tombol unduh di bawah.
            </p>
            <div className="pt-2">
              <a
                href={fileDetails.path}
                download={fileDetails.name}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 text-pure-white font-semibold text-xs hover:bg-rose-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas Sekarang</span>
              </a>
            </div>
          </div>
        )}

        {/* Container for rendered docx */}
        <div
          className={`relative rounded-xl overflow-hidden border border-[#28332C]/10 bg-[#EFEFEA]/60 ${
            loading ? 'hidden' : 'block'
          }`}
        >
          {/* Scrollable Document Viewer */}
          <div
            ref={containerRef}
            className="numora-docx-preview-viewport overflow-y-auto max-h-[720px] p-2 sm:p-6 text-charcoal"
            style={{
              WebkitOverflowScrolling: 'touch'
            }}
          />
        </div>

        {/* Footer info pratinjau */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-secondary-text">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-forest" />
            <span>
              Menampilkan seluruh transkrip wawancara, pertanyaan pendalaman, dan kesimpulan tematik dari berkas asli.
            </span>
          </div>

          <a
            href={fileDetails.path}
            download={fileDetails.name}
            className="text-forest hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <Download className="w-3 h-3" />
            <span>Unduh Berkas (.docx)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
