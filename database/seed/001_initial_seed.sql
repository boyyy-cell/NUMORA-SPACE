-- ==============================================================================
-- NUMORA SPACE v1.7 — INITIAL SEED TEMPLATE (NON-ACTIVE / DRAFT)
-- File: database/seed/001_initial_seed.sql
-- PERINGATAN ETIKA PENELITIAN:
-- File ini HANYA merupakan cetak biru template administratif.
-- JANGAN MENJALANKAN FILE INI SECARA OTOMATIS.
-- TIDAK ADA data peserta, nama siswa, atau pemetaan akun fiktif yang dibuat.
-- ==============================================================================

-- Subjek S-001 dan S-002 HANYA didaftarkan jika protokol penelitian telah diverifikasi
-- dan akun user_id riil yang sah telah disetujui melalui persetujuan (informed consent).

/*
-- CONTOH PENETAPAN SUBJEK RIEL OLEH PENELITI SETELAH VERIFIKASI (NON-AKTIF):

INSERT INTO public.research_subjects (
    subject_code,
    user_id,
    group_type,
    enrollment_status,
    consent_status,
    enrolled_at
) VALUES 
(
    'S-001',
    NULL, -- Belum terikat ke akun hingga sesi tatap muka terverifikasi
    'Control',
    'Active',
    'Pending',
    now()
),
(
    'S-002',
    NULL, -- Terikat ke akun siswa eksperimen setelah consent formulir ditandatangani
    'Experimental',
    'Active',
    'Pending',
    now()
)
ON CONFLICT (subject_code) DO NOTHING;
*/
