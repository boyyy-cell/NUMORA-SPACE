-- ==============================================================================
-- NUMORA SPACE v1.7 — INITIAL DATABASE SCHEMA & RLS MIGRATION
-- File: database/migrations/001_initial_schema.sql
-- Tujuan: Menyediakan skema 5 tabel inti, integritas referensial, safe trigger,
--         dan kebijakan Row Level Security (RLS) berbasis least privilege.
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABEL PROFILES (Ekstensi Identitas auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    school VARCHAR(150),
    grade VARCHAR(50) DEFAULT 'SMP Kelas VII',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Role hanya boleh bernilai 'student' atau 'researcher'
    CONSTRAINT chk_profiles_role CHECK (role IN ('student', 'researcher')),
    CONSTRAINT chk_profiles_name_not_empty CHECK (char_length(trim(full_name)) > 0)
);

COMMENT ON TABLE public.profiles IS 'Menyimpan profil identitas aplikasi yang berelasi 1-to-1 dengan auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'Peran pengguna. Registrasi publik selalu menghasilkan role student.';

-- ==============================================================================
-- 3. TABEL RESEARCH_SUBJECTS (Pemisahan Subjek Penelitian S-001 & S-002)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.research_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    group_type VARCHAR(30) NOT NULL,
    enrollment_status VARCHAR(20) NOT NULL DEFAULT 'Active',
    consent_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Pembatasan kode subjek resmi protokol penelitian
    CONSTRAINT chk_subjects_code CHECK (subject_code IN ('S-001', 'S-002')),
    CONSTRAINT chk_subjects_group CHECK (group_type IN ('Control', 'Experimental')),
    CONSTRAINT chk_subjects_status CHECK (enrollment_status IN ('Active', 'Completed', 'Withdrawn')),
    CONSTRAINT chk_subjects_consent CHECK (consent_status IN ('Consented', 'Pending', 'Exempt'))
);

COMMENT ON TABLE public.research_subjects IS 'Menyimpan pemetaan resmi subjek penelitian terotorisasi. Pengguna publik tidak otomatis masuk ke tabel ini.';

-- ==============================================================================
-- 4. TABEL EVALUATION_ATTEMPTS (Sesi Percobaan Evaluasi Siswa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evaluation_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.research_subjects(id) ON DELETE SET NULL,
    assessment_type VARCHAR(30) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL DEFAULT 0,
    incorrect_answers INT NOT NULL DEFAULT 0,
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    accuracy_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    duration_seconds INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_attempts_type CHECK (assessment_type IN ('FORMATIVE_PRACTICE', 'RESEARCH_PRETEST', 'RESEARCH_POSTTEST')),
    CONSTRAINT chk_attempts_status CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    CONSTRAINT chk_attempts_total_questions CHECK (total_questions > 0),
    CONSTRAINT chk_attempts_correct CHECK (correct_answers >= 0 AND correct_answers <= total_questions),
    CONSTRAINT chk_attempts_incorrect CHECK (incorrect_answers >= 0 AND incorrect_answers <= total_questions),
    CONSTRAINT chk_attempts_score CHECK (score >= 0.00 AND score <= 100.00),
    CONSTRAINT chk_attempts_accuracy CHECK (accuracy_percentage >= 0.00 AND accuracy_percentage <= 100.00),
    CONSTRAINT chk_attempts_duration CHECK (duration_seconds >= 0)
);

COMMENT ON TABLE public.evaluation_attempts IS 'Mencatat sesi percobaan evaluasi siswa beserta ringkasan nilai dan status penguncian.';

-- ==============================================================================
-- 5. TABEL EVALUATION_ANSWERS (Jawaban Butir Soal per Percobaan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evaluation_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.evaluation_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    topic VARCHAR(50) NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    misconception_code VARCHAR(50),
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Mencegah submisi ganda untuk butir soal yang sama dalam 1 attempt
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

COMMENT ON TABLE public.evaluation_answers IS 'Menyimpan rekaman jawaban aktual siswa per butir soal yang divalidasi oleh backend.';

-- ==============================================================================
-- 6. TABEL RESEARCH_SESSIONS (Catatan Log Sesi Penelitian)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.research_subjects(id) ON DELETE SET NULL,
    session_type VARCHAR(30) NOT NULL,
    source VARCHAR(30) NOT NULL,
    duration_seconds NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_sessions_type CHECK (session_type IN ('EVALUATION', 'LEARNING', 'NUMORA_RUN')),
    CONSTRAINT chk_sessions_source CHECK (source IN ('STUDENT_LIVE_SESSION', 'PUBLIC_USER_ACTIVITY', 'DEMO_SEED', 'PROTOCOL_TEMPLATE')),
    CONSTRAINT chk_sessions_duration CHECK (duration_seconds >= 0.00)
);

COMMENT ON TABLE public.research_sessions IS 'Menyimpan log agregat aktivitas pembelajaran yang relevan bagi protokol riset.';

-- ==============================================================================
-- 7. INDEKS KINERJA & INTEGRITAS REFERENSIAL
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_research_subjects_user_id ON public.research_subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_user_id ON public.evaluation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_subject_id ON public.evaluation_attempts(subject_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_status ON public.evaluation_attempts(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_attempts_created_at ON public.evaluation_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluation_answers_attempt_id ON public.evaluation_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_answers_topic ON public.evaluation_answers(topic);
CREATE INDEX IF NOT EXISTS idx_research_sessions_subject_id ON public.research_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON public.research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_type_source ON public.research_sessions(session_type, source);

-- ==============================================================================
-- 8. HELPER SECURITY FUNCTION: is_researcher()
-- Fungsi aman untuk memeriksa apakah pemanggil memiliki role 'researcher'
-- Didesain dengan SECURITY DEFINER dan fixed search_path untuk mencegah rekursi RLS.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_researcher(lookup_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = lookup_user_id AND role = 'researcher'
    );
$$;

-- Cabut izin dari publik, berikan secara ketat hanya kepada authenticated dan service_role
REVOKE EXECUTE ON FUNCTION public.is_researcher(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_researcher(UUID) TO authenticated, service_role;

-- ==============================================================================
-- 9. SAFE SIGNUP TRIGGER FUNCTION: handle_new_user()
-- Otomatis membuat baris di public.profiles saat pendaftaran Supabase Auth berhasil.
-- Memaksa role 'student' (mengabaikan klaim role dari metadata client).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    clean_name TEXT;
    clean_school TEXT;
    clean_grade TEXT;
BEGIN
    -- Pembersihan input metadata
    clean_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), '');
    clean_school := NULLIF(TRIM(NEW.raw_user_meta_data->>'school'), '');
    clean_grade := NULLIF(TRIM(NEW.raw_user_meta_data->>'grade'), '');

    -- FORCED LEAST PRIVILEGE: Selalu masukkan role 'student'
    -- Metadata role dari client secara eksplisit DIABAIKAN.
    INSERT INTO public.profiles (
        id,
        full_name,
        role,
        school,
        grade,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(clean_name, 'Siswa NUMORA'),
        'student', -- Strict forced value
        clean_school,
        COALESCE(clean_grade, 'SMP Kelas VII'),
        now(),
        now()
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback aman jika terjadi kesalahan tak terduga agar signup auth.users tidak gagal
        INSERT INTO public.profiles (id, full_name, role, grade, created_at, updated_at)
        VALUES (NEW.id, 'Siswa NUMORA', 'student', 'SMP Kelas VII', now(), now())
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
END;
$$;

-- Pasang trigger pada tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Prinsip: Least Privilege. Anonymous ditolak di seluruh tabel.
-- ==============================================================================

-- Aktifkan RLS pada seluruh 5 tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. POLICIES: PROFILES
-- ------------------------------------------------------------------------------
-- 1. Pengguna dapat membaca profil miliknya; Peneliti dapat membaca profil siswa
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        auth.uid() = id
        OR public.is_researcher(auth.uid())
    );

-- 2. Pengguna dapat memperbarui nama dan sekolah miliknya, TETAPI TIDAK BISA MENGUBAH ROLE
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    );

-- 3. INSERT dan DELETE profiles dilarang untuk client authenticated (hanya trigger / service_role)
-- Tidak dibuat policy INSERT/DELETE untuk authenticated sehingga otomatis ditolak.

-- ------------------------------------------------------------------------------
-- B. POLICIES: RESEARCH_SUBJECTS
-- ------------------------------------------------------------------------------
-- 1. Peneliti dapat membaca seluruh subjek penelitian. Siswa hanya dapat membaca jika terhubung.
CREATE POLICY "research_subjects_select_policy" ON public.research_subjects
    FOR SELECT TO authenticated
    USING (
        public.is_researcher(auth.uid())
        OR auth.uid() = user_id
    );

-- 2. INSERT, UPDATE, DELETE dilarang keras bagi pengguna biasa (hanya service_role administratif)

-- ------------------------------------------------------------------------------
-- C. POLICIES: EVALUATION_ATTEMPTS
-- ------------------------------------------------------------------------------
-- 1. Siswa hanya dapat membaca percobaan miliknya; Peneliti dapat membaca untuk analisis
CREATE POLICY "attempts_select_policy" ON public.evaluation_attempts
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR public.is_researcher(auth.uid())
    );

-- 2. Siswa hanya dapat membuat percobaan atas namanya sendiri
CREATE POLICY "attempts_insert_policy" ON public.evaluation_attempts
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'in_progress'
    );

-- 3. Siswa dapat memperbarui attempt HANYA jika status masih 'in_progress'
-- Attempt berstatus 'completed' DIKUNCI dan TIDAK DAPAT diubah lagi oleh siswa.
CREATE POLICY "attempts_update_policy" ON public.evaluation_attempts
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id
        AND status = 'in_progress'
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- ------------------------------------------------------------------------------
-- D. POLICIES: EVALUATION_ANSWERS
-- ------------------------------------------------------------------------------
-- 1. Siswa dapat membaca jawaban dari attempt miliknya; Peneliti dapat membaca
CREATE POLICY "answers_select_policy" ON public.evaluation_answers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.evaluation_attempts a
            WHERE a.id = evaluation_answers.attempt_id
            AND (a.user_id = auth.uid() OR public.is_researcher(auth.uid()))
        )
    );

-- 2. Siswa dapat menyisipkan jawaban HANYA jika attempt masih 'in_progress' dan miliknya
CREATE POLICY "answers_insert_policy" ON public.evaluation_answers
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.evaluation_attempts a
            WHERE a.id = evaluation_answers.attempt_id
            AND a.user_id = auth.uid()
            AND a.status = 'in_progress'
        )
    );

-- 3. UPDATE dan DELETE answers dilarang untuk client (jawaban tidak boleh direvisi setelah disubmit)

-- ------------------------------------------------------------------------------
-- E. POLICIES: RESEARCH_SESSIONS
-- ------------------------------------------------------------------------------
-- 1. Peneliti dapat membaca seluruh sesi riset. Siswa hanya dapat membaca sesi miliknya.
CREATE POLICY "sessions_select_policy" ON public.research_sessions
    FOR SELECT TO authenticated
    USING (
        public.is_researcher(auth.uid())
        OR auth.uid() = user_id
    );

-- 2. Siswa dapat menyisipkan log sesi belajarnya sendiri
CREATE POLICY "sessions_insert_policy" ON public.research_sessions
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );

-- 3. UPDATE dan DELETE sesi dilarang untuk client biasa (integritas audit trail)
