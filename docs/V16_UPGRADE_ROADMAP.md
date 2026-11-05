# NUMORA Space v1.6 — Phased Upgrade Roadmap
**Algebra, Beyond Formulas.**
*Document Version: 1.6-Phase0 | Date: 2026-11-05*

---

## 1. Ikhtisar Alur Pengembangan Bertahap (Phased Roadmap)
Pengembangan NUMORA Space v1.6 dilaksanakan dengan metode inkremental teruji untuk memastikan tidak ada fitur atau logika matematika yang terganggu:

```
[ Phase 0: Baseline Audit & Safety Checkpoint ] ---> (SELESAI)
                    │
                    ▼
[ Phase 1: Design Tokens & Tailwind Midnight Orchid Architecture ]
                    │
                    ▼
[ Phase 2: Landing Page & Public Visual Storytelling Revitalization ]
                    │
                    ▼
[ Phase 3: Student Space, Algebra Lab & 3D Balance Visual Sync ]
                    │
                    ▼
[ Phase 4: NORA Socratic Intelligence & Voice Experience Polish ]
                    │
                    ▼
[ Phase 5: Researcher Space, Protocol Form & Leppink Instrument ]
                    │
                    ▼
[ Phase 6: Accessibility (WCAG 2.1 AA), PWA & Mobile Ergonomics ]
                    │
                    ▼
[ Phase 7: End-to-End Regression Test Suite & Final Release ]
```

---

## 2. Rincian Sasaran Setiap Fase

### Phase 0: Project Safety, Baseline Audit & Visual Identity Direction (STATUS: SELESAI)
- Inisialisasi Git checkpoint commit: `chore: checkpoint before NUMORA Space v1.6 upgrade`.
- Audit 20 fitur inti tanpa mengganggu kode yang berjalan.
- Verifikasi keamanan (.env untracked, no secrets in repo).
- Penyusunan dokumen arsitektur dan spesifikasi warna Midnight Orchid.

### Phase 1: Design Tokens & Tailwind Midnight Orchid Architecture
- **Target File**: `frontend/tailwind.config.js`, `frontend/src/styles/designTokens.js`, `frontend/src/styles/index.css`.
- **Aktivitas**:
  - Konfigurasi palet baru: Midnight Plum (`#19151F`), Deep Aubergine (`#28222F`), Soft Orchid (`#B69AD9`), Warm Apricot (`#F0A77E`), Sage Green (`#A8BFA9`), Ivory White (`#F5EFE5`), Muted Lavender (`#C8B9C9`).
  - Pembuatan utilitas CSS glassmorphism bertema aubergine-plum.
  - Verifikasi kompatibilitas build Vite (`npm run build`).

### Phase 2: Landing Page & Public Navigation Revitalization
- **Target File**: `frontend/src/pages/LandingPage.jsx`, `frontend/src/components/layout/Navbar.jsx`, `frontend/src/components/layout/Footer.jsx`, `frontend/src/components/common/BrandLogo.jsx`.
- **Aktivitas**:
  - Transformasi estetika Hero section ke Midnight Orchid.
  - Peremajaan logo geometris N dengan gradien Orchid-Apricot.
  - Peningkatan visual storytelling tanpa mengurangi performa loading.

### Phase 3: Student Space, Algebra Lab & 3D Balance Visual Sync
- **Target File**: `frontend/src/pages/StudentDashboard.jsx`, `frontend/src/features/learning/AlgebraLab.jsx`, `frontend/src/features/learning/AlgebraBalance3D.jsx`, `frontend/src/features/learning/MathematicalChallenge.jsx`.
- **Aktivitas**:
  - Penerapan tema Deep Aubergine pada kartu modul dan drawer silabus.
  - Sinkronisasi warna material 3D Three.js (Soft Orchid beam, Warm Apricot weights, Sage Green equilibrium).
  - Peningkatan kejelasan visual token positif (+1) dan negatif (-1) pada Variable & Coefficient Explorer.

### Phase 4: NORA Socratic Intelligence & Voice Experience Polish
- **Target File**: `frontend/src/features/nora/NoraChatPreview.jsx`, `frontend/src/services/voiceService.js`, `backend/app/api/v1/endpoints/nora.py`.
- **Aktivitas**:
  - Penyelarasan bubble chat NORA dengan palet Soft Orchid & Warm Apricot.
  - Visual audio waveform pulse saat narasi suara aktif.
  - Penyempurnaan kamus fonetik matematika Indonesia untuk notasi pecahan dan tanda kurung.

### Phase 5: Researcher Space, Protocol Form & Leppink Instrument
- **Target File**: `frontend/src/pages/ResearcherDashboard.jsx`, `backend/app/api/v1/endpoints/research.py`, `backend/app/services/research_store.py`.
- **Aktivitas**:
  - Antarmuka instrumen kuesioner digital Leppink 10 butir (skala 0-10 Likert) untuk Intrinsic, Extraneous, dan Germane Load.
  - Form input catatan observasi kualitatif bagi peneliti pada sesi tatap muka S-001 dan sesi digital S-002.
  - Tetap mempertahankan data autentik tanpa angka fiktif.

### Phase 6: Accessibility (WCAG 2.1 AA), PWA & Mobile Ergonomics
- **Target File**: `frontend/index.html`, `frontend/public/manifest.webmanifest`, `frontend/src/styles/index.css`.
- **Aktivitas**:
  - Uji kontras rasio keyboard focus rings pada seluruh input dan slider.
  - Pembaruan tema PWA (`theme-color: #19151F`).
  - Uji tata letak pada viewport smartphone Android dan tablet.

### Phase 7: End-to-End Regression Test Suite & Final Release
- **Target File**: `tests/test_api.py`, `README.md`.
- **Aktivitas**:
  - Menjalankan seluruh pengujian 5 kasus matematika wajib:
    - $3x + 5$ ($x=4$) $\implies 17$
    - $5x$ ($x=3$) $\implies 15$
    - $-3x$ ($x=2$) $\implies -6$
    - $7x - 4$ ($x=2$) $\implies 10$
    - $4x + 6$ ($x=5$) $\implies 26$
  - Verifikasi production build bundling dan pembuatan laporan rilis final v1.6.

