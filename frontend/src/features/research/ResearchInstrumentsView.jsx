import React, { useState } from 'react';
import {
  FileText,
  HelpCircle,
  Eye,
  ListOrdered,
  Printer,
  Download,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  Info,
  User,
  Calendar,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import {
  INSTRUMENT_METADATA,
  EVALUATION_TEST_QUESTIONS,
  SCORING_RUBRIC,
  INTERVIEW_PROTOCOL_QUESTIONS,
  OBSERVATION_ASPECTS,
  RESEARCH_PROCEDURES
} from '../../data/researchInstrumentsData';

export default function ResearchInstrumentsView({ cogStatus }) {
  const [activeTab, setActiveTab] = useState('evaluation');
  const [showAnswerKeys, setShowAnswerKeys] = useState(false);
  const [interviewSubjectFilter, setInterviewSubjectFilter] = useState('ALL'); // ALL, S-001, S-002
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedObservations, setExpandedObservations] = useState({
    A: true,
    B: true,
    C: true,
    D: true
  });

  // Lembar Observasi Interactive State (empty by default)
  const [obsMetadata, setObsMetadata] = useState({
    subjectCode: '',
    date: new Date().toISOString().split('T')[0],
    topic: 'Aljabar: Variabel, Koefisien, Konstanta',
    observer: ''
  });

  const [obsChecklist, setObsChecklist] = useState({});
  const [obsNotes, setObsNotes] = useState({});

  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleObservationAspect = (aspectId) => {
    setExpandedObservations(prev => ({ ...prev, [aspectId]: !prev[aspectId] }));
  };

  const handleObsCheck = (indId, status) => {
    setObsChecklist(prev => ({
      ...prev,
      [indId]: prev[indId] === status ? null : status
    }));
  };

  const handleObsNoteChange = (indId, text) => {
    setObsNotes(prev => ({
      ...prev,
      [indId]: text
    }));
  };

  const resetObservationForm = () => {
    if (window.confirm('Kosongkan seluruh isian Lembar Observasi?')) {
      setObsChecklist({});
      setObsNotes({});
      setObsMetadata(prev => ({ ...prev, subjectCode: '' }));
    }
  };

  // Export Interview Guide
  const downloadInterviewGuide = () => {
    let content = `# PEDOMAN WAWANCARA SISWA - NUMORA SPACE RESEARCH\n`;
    content += `Materi: ${INSTRUMENT_METADATA.topic} | Target: ${INSTRUMENT_METADATA.targetGrade}\n`;
    content += `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    content += `========================================================================\n\n`;
    content += `BAGIAN A: 10 PERTANYAAN INTI\n\n`;

    INTERVIEW_PROTOCOL_QUESTIONS.filter(q => q.type === 'main').forEach((q, idx) => {
      content += `${idx + 1}. [${q.focusArea.toUpperCase()}]\n`;
      content += `   Pertanyaan Dasar: ${q.coreQuestion}\n`;
      content += `   Adaptasi S-001 (Kontrol · Direct): ${q.s001Context}\n`;
      content += `   Adaptasi S-002 (Eksperimen · NUMORA Space): ${q.s002Context}\n`;
      content += `   --------------------------------------------------------------------\n`;
      content += `   Jawaban Siswa:\n\n\n`;
      content += `   Catatan Peneliti:\n\n\n\n`;
    });

    content += `========================================================================\n\n`;
    content += `BAGIAN B: 5 PERTANYAAN PENDALAMAN\n\n`;

    INTERVIEW_PROTOCOL_QUESTIONS.filter(q => q.type === 'deepening').forEach((q, idx) => {
      content += `${idx + 1}. [PENDALAMAN - ${q.focusArea.toUpperCase()}]\n`;
      content += `   Pertanyaan: ${q.coreQuestion}\n`;
      content += `   Fokus S-001: ${q.s001Context}\n`;
      content += `   Fokus S-002: ${q.s002Context}\n`;
      content += `   --------------------------------------------------------------------\n`;
      content += `   Jawaban Siswa:\n\n\n`;
      content += `   Catatan Peneliti:\n\n\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pedoman_Wawancara_NUMORA_Space_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Observation Form
  const downloadObservationSheet = () => {
    let content = `# LEMBAR OBSERVASI PEMBELAJARAN - NUMORA SPACE\n`;
    content += `Subjek Penelitian : ${obsMetadata.subjectCode || '..................'}\n`;
    content += `Tanggal Pelaksanaan: ${obsMetadata.date}\n`;
    content += `Materi Pembelajaran: ${obsMetadata.topic}\n`;
    content += `Nama Pengamat      : ${obsMetadata.observer}\n`;
    content += `========================================================================\n\n`;

    OBSERVATION_ASPECTS.forEach(aspect => {
      content += `ASPEK ${aspect.id}. ${aspect.title.toUpperCase()}\n`;
      content += `Deskripsi: ${aspect.description}\n`;
      content += `------------------------------------------------------------------------\n`;
      aspect.indicators.forEach((ind, i) => {
        const status = obsChecklist[ind.id] ? `[${obsChecklist[ind.id]}]` : '[ ]';
        const note = obsNotes[ind.id] ? ` | Catatan: ${obsNotes[ind.id]}` : '';
        content += `${i + 1}. ${status} ${ind.text}${note}\n`;
      });
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lembar_Observasi_${obsMetadata.subjectCode || 'Form'}_${obsMetadata.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredInterviewQuestions = INTERVIEW_PROTOCOL_QUESTIONS.filter(q => {
    if (interviewSubjectFilter === 'ALL') return true;
    return true; // We show both contexts or highlight the selected one
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-[#FAF9F6] border border-[#8DA399]/30 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8DA399]/15 text-[#28332C] border border-[#8DA399]/40">
                Instrumen Penelitian Resmi
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D58B68]/15 text-[#D58B68] border border-[#D58B68]/30">
                SMP Kelas VII · Semester Genap
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#28332C]">
              Instrumen Pengumpulan Data Penelitian
            </h1>
            <p className="text-sm text-[#28332C]/70 max-w-3xl">
              Instrumen operasional penelitian komparasi efektivitas pembelajaran aljabar antara metode konvensional (S-001) dan platform NUMORA Space berbantuan NORA AI (S-002).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#8DA399]/50 bg-white hover:bg-[#8DA399]/10 text-[#28332C] text-sm font-medium transition shadow-sm"
              title="Cetak lembar instrumen"
            >
              <Printer className="w-4 h-4 text-[#8DA399]" />
              <span>Cetak Instrumen</span>
            </button>
          </div>
        </div>

        {/* METADATA STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#8DA399]/20 text-xs">
          <div>
            <span className="text-[#28332C]/60 block">Materi Pembelajaran</span>
            <span className="font-semibold text-[#28332C]">Aljabar: Variabel, Koefisien, Konstanta, dan Bentuk Aljabar</span>
          </div>
          <div>
            <span className="text-[#28332C]/60 block">Target Subjek Penelitian</span>
            <span className="font-semibold text-[#28332C]">{INSTRUMENT_METADATA.targetGrade}</span>
          </div>
          <div>
            <span className="text-[#28332C]/60 block">Peneliti</span>
            <span className="font-semibold text-[#28332C]">Peneliti Utama</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-[#8DA399]/30 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'evaluation'
              ? 'bg-[#FAF9F6] border-t-2 border-t-[#D58B68] border-x border-[#8DA399]/30 text-[#28332C] font-semibold -mb-px shadow-xs'
              : 'text-[#28332C]/70 hover:text-[#28332C] hover:bg-[#FAF9F6]/50'
          }`}
        >
          <Award className="w-4 h-4 text-[#D58B68]" />
          <span>Tes Evaluasi Aljabar (10 Soal)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#8DA399]/20 text-[#28332C]">
            Max 100 Poin
          </span>
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'interview'
              ? 'bg-[#FAF9F6] border-t-2 border-t-[#D58B68] border-x border-[#8DA399]/30 text-[#28332C] font-semibold -mb-px shadow-xs'
              : 'text-[#28332C]/70 hover:text-[#28332C] hover:bg-[#FAF9F6]/50'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#8DA399]" />
          <span>Pedoman Wawancara Siswa</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#8DA399]/20 text-[#28332C]">
            15 Pertanyaan
          </span>
        </button>

        <button
          onClick={() => setActiveTab('observation')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'observation'
              ? 'bg-[#FAF9F6] border-t-2 border-t-[#D58B68] border-x border-[#8DA399]/30 text-[#28332C] font-semibold -mb-px shadow-xs'
              : 'text-[#28332C]/70 hover:text-[#28332C] hover:bg-[#FAF9F6]/50'
          }`}
        >
          <Eye className="w-4 h-4 text-[#8DA399]" />
          <span>Lembar Observasi Pembelajaran</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#8DA399]/20 text-[#28332C]">
            4 Aspek · Siap Isi
          </span>
        </button>

        <button
          onClick={() => setActiveTab('procedures')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'procedures'
              ? 'bg-[#FAF9F6] border-t-2 border-t-[#D58B68] border-x border-[#8DA399]/30 text-[#28332C] font-semibold -mb-px shadow-xs'
              : 'text-[#28332C]/70 hover:text-[#28332C] hover:bg-[#FAF9F6]/50'
          }`}
        >
          <ListOrdered className="w-4 h-4 text-[#8DA399]" />
          <span>Prosedur Pengumpulan Data</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#8DA399]/20 text-[#28332C]">
            S-001 vs S-002
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: TES EVALUASI PEMAHAMAN ALJABAR */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {/* RUBRIC & SUMMARY BAR */}
          <div className="bg-[#FAF9F6] border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#8DA399]/20">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#28332C] flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#D58B68]" />
                  Spesifikasi & Pedoman Penskoran Tes Evaluasi
                </h2>
                <p className="text-xs text-[#28332C]/70 mt-1">
                  Total 10 butir soal essay terstruktur. Setiap butir bernilai tepat 10 poin (Benar = 10, Salah/Kosong = 0). Skor Maksimum = 100.
                </p>
              </div>

              {/* RESEARCHER KEY TOGGLE */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
                    showAnswerKeys
                      ? 'bg-[#D58B68] text-white hover:bg-[#c27a58]'
                      : 'bg-white border border-[#8DA399]/40 text-[#28332C] hover:bg-[#8DA399]/10'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{showAnswerKeys ? 'Sembunyikan Kunci Jawaban' : 'Tampilkan Kunci & Rubrik Peneliti'}</span>
                </button>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {SCORING_RUBRIC.categories.map((cat, idx) => (
                <div key={idx} className="bg-white border border-[#8DA399]/30 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8DA399] uppercase tracking-wider">{cat.name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#28332C] border border-[#8DA399]/20">
                      {cat.questionCount} Soal
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-serif font-bold text-[#28332C]">{cat.maxScore}</span>
                    <span className="text-[11px] text-[#28332C]/60">Poin Maksimal</span>
                  </div>
                  <p className="text-[11px] text-[#28332C]/70 mt-1 line-clamp-1">{cat.description}</p>
                </div>
              ))}
            </div>

            {showAnswerKeys && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Mode Peneliti Aktif:</strong> Kunci jawaban, penjelasan konsep, dan bobot rubrik ditampilkan di setiap butir soal. Mode ini dilindungi dan hanya untuk verifikasi penguji.
                </span>
              </div>
            )}
          </div>

          {/* QUESTIONS LIST */}
          <div className="space-y-4">
            {EVALUATION_TEST_QUESTIONS.map((q) => {
              const isExpanded = expandedQuestions[q.id] !== false; // default open
              return (
                <div
                  key={q.id}
                  className="bg-white border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm hover:border-[#8DA399]/50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-7 h-7 rounded-lg bg-[#28332C] text-white flex items-center justify-center font-serif font-bold text-sm">
                          {q.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8DA399]/15 text-[#28332C] border border-[#8DA399]/30">
                          {q.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAF9F6] text-[#28332C]/80 border border-[#8DA399]/20">
                          Indikator: {q.indicator}
                        </span>
                        <span className="text-xs font-bold text-[#D58B68] ml-auto sm:ml-0">
                          Bobot: {q.points} Poin
                        </span>
                      </div>
                      <p className="text-base text-[#28332C] font-medium pt-3 leading-relaxed">
                        {q.prompt}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleQuestion(q.id)}
                      className="text-[#28332C]/40 hover:text-[#28332C] p-1"
                      aria-label="Toggle detail soal"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#8DA399]/15 space-y-3">
                      {q.mathContent && (
                        <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#8DA399]/20 font-mono text-sm text-[#28332C] inline-block">
                          {q.mathContent}
                        </div>
                      )}

                      {/* ANSWER KEY (CONDITIONAL) */}
                      {showAnswerKeys ? (
                        <div className="p-4 bg-[#8DA399]/10 rounded-xl border border-[#8DA399]/30 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D58B68] text-white uppercase tracking-wider">
                              Kunci Jawaban Peneliti
                            </span>
                            <span className="text-sm font-bold text-[#28332C] font-mono">
                              {q.answerKey}
                            </span>
                          </div>
                          <p className="text-xs text-[#28332C]/80">
                            <strong>Penjelasan Konsep:</strong> {q.explanation}
                          </p>

                          {/* PARTIAL SCORING RUBRIC (E.G., QUESTION 10) */}
                          {q.partialScoring ? (
                            <div className="mt-2 pt-2 border-t border-[#8DA399]/20 space-y-1.5">
                              <span className="text-[11px] font-bold text-[#28332C] block">
                                Rincian Rubrik Penilaian Parsial (Total: {q.points} Poin):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                {Object.entries(q.partialScoring).map(([key, item]) => (
                                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#8DA399]/20">
                                    <span className="text-[#28332C]">{item.label}</span>
                                    <span className="font-bold text-[#D58B68] ml-2">+{item.points} Poin</span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[10px] text-[#28332C]/60 italic pt-0.5">
                                Siswa mendapatkan skor parsial sesuai dengan komponen jawaban yang dijawab dengan benar.
                              </p>
                            </div>
                          ) : (
                            <div className="text-[11px] text-[#28332C]/60 italic pt-1 border-t border-[#8DA399]/20">
                              Pedoman penskoran: Benar bernilai 10 poin; Tidak dijawab atau salah bernilai 0 poin.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-[#28332C]/50 italic flex items-center gap-1.5 pt-1">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Kunci jawaban disembunyikan. Klik tombol "Tampilkan Kunci & Rubrik Peneliti" di atas untuk melihat pedoman penskoran.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PEDOMAN WAWANCARA SISWA */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F6] border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#8DA399]/20">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#28332C] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#D58B68]" />
                  Pedoman & Lembar Pencatatan Wawancara Mendalam
                </h2>
                <p className="text-xs text-[#28332C]/70 mt-1">
                  10 Pertanyaan Inti + 5 Pertanyaan Pendalaman. Format siap cetak dengan adaptasi konteks S-001 (Kontrol/Direct) dan S-002 (Eksperimen/NUMORA Space).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={downloadInterviewGuide}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#8DA399]/40 text-xs font-semibold text-[#28332C] hover:bg-[#8DA399]/15 transition shadow-sm"
                >
                  <Download className="w-4 h-4 text-[#8DA399]" />
                  <span>Unduh Lembar Wawancara (.txt)</span>
                </button>
              </div>
            </div>

            {/* SUBJECT FILTER SWITCHER */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs font-semibold text-[#28332C]/70">Fokus Tampilan Adaptasi:</span>
              <button
                type="button"
                onClick={() => setInterviewSubjectFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  interviewSubjectFilter === 'ALL'
                    ? 'bg-[#28332C] text-white'
                    : 'bg-white border border-[#8DA399]/30 text-[#28332C]/70 hover:bg-[#FAF9F6]'
                }`}
              >
                Komparasi Keduanya (S-001 & S-002)
              </button>
              <button
                type="button"
                onClick={() => setInterviewSubjectFilter('S-001')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  interviewSubjectFilter === 'S-001'
                    ? 'bg-[#8DA399] text-white'
                    : 'bg-white border border-[#8DA399]/30 text-[#28332C]/70 hover:bg-[#FAF9F6]'
                }`}
              >
                S-001 (Kontrol · Direct Teaching)
              </button>
              <button
                type="button"
                onClick={() => setInterviewSubjectFilter('S-002')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  interviewSubjectFilter === 'S-002'
                    ? 'bg-[#D58B68] text-white'
                    : 'bg-white border border-[#8DA399]/30 text-[#28332C]/70 hover:bg-[#FAF9F6]'
                }`}
              >
                S-002 (Eksperimen · NUMORA Space)
              </button>
            </div>
          </div>

          {/* SECTION A: 10 PERTANYAAN INTI */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md bg-[#28332C] text-white text-xs font-serif font-bold">
                BAGIAN A
              </span>
              <h3 className="font-serif font-bold text-base text-[#28332C]">
                10 Pertanyaan Inti Wawancara
              </h3>
            </div>

            {filteredInterviewQuestions.filter(q => q.type === 'main').map((q) => (
              <div
                key={q.id}
                className="bg-white border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#8DA399]/40 text-[#28332C] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      {q.number}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-[#8DA399] uppercase tracking-wider block">
                        Fokus: {q.focusArea}
                      </span>
                      <h4 className="text-base font-semibold text-[#28332C] mt-0.5">
                        {q.coreQuestion}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* COMPARATIVE CONTEXT BOXES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {(interviewSubjectFilter === 'ALL' || interviewSubjectFilter === 'S-001') && (
                    <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#8DA399]/30 text-xs space-y-1">
                      <span className="font-bold text-[#28332C] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#8DA399]"></span>
                        Adaptasi S-001 (Kontrol · Direct Teaching)
                      </span>
                      <p className="text-[#28332C]/80 italic">"{q.s001Context}"</p>
                    </div>
                  )}

                  {(interviewSubjectFilter === 'ALL' || interviewSubjectFilter === 'S-002') && (
                    <div className="p-3.5 rounded-xl bg-[#D58B68]/5 border border-[#D58B68]/30 text-xs space-y-1">
                      <span className="font-bold text-[#D58B68] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D58B68]"></span>
                        Adaptasi S-002 (Eksperimen · NUMORA Space)
                      </span>
                      <p className="text-[#28332C]/80 italic">"{q.s002Context}"</p>
                    </div>
                  )}
                </div>

                {/* RECORDING FIELD (BLANK SHEET SIMULATION) */}
                <div className="mt-2 pt-3 border-t border-[#8DA399]/15 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-dashed border-[#8DA399]/40 rounded-xl p-3 bg-neutral-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#28332C]/60 block mb-1">
                      Kolom Jawaban Siswa
                    </span>
                    <div className="h-14 text-xs text-[#28332C]/40 italic flex items-center justify-center border border-dashed border-neutral-200 rounded bg-white">
                      [Kolom kosong untuk pencatatan respons lisan siswa]
                    </div>
                  </div>
                  <div className="border border-dashed border-[#8DA399]/40 rounded-xl p-3 bg-neutral-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#28332C]/60 block mb-1">
                      Kolom Catatan Peneliti
                    </span>
                    <div className="h-14 text-xs text-[#28332C]/40 italic flex items-center justify-center border border-dashed border-neutral-200 rounded bg-white">
                      [Kolom kosong untuk catatan observasi perilaku peneliti]
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION B: 5 PERTANYAAN PENDALAMAN */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md bg-[#D58B68] text-white text-xs font-serif font-bold">
                BAGIAN B
              </span>
              <h3 className="font-serif font-bold text-base text-[#28332C]">
                5 Pertanyaan Pendalaman (Probing)
              </h3>
            </div>

            {filteredInterviewQuestions.filter(q => q.type === 'deepening').map((q) => (
              <div
                key={q.id}
                className="bg-white border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#D58B68]/15 text-[#D58B68] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                    {q.number}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-[#D58B68] uppercase tracking-wider block">
                      Pendalaman: {q.focusArea}
                    </span>
                    <h4 className="text-base font-semibold text-[#28332C] mt-0.5">
                      {q.coreQuestion}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#8DA399]/30 text-xs space-y-1">
                    <span className="font-bold text-[#28332C]">Fokus S-001:</span>
                    <p className="text-[#28332C]/80 italic">"{q.s001Context}"</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#D58B68]/5 border border-[#D58B68]/30 text-xs space-y-1">
                    <span className="font-bold text-[#D58B68]">Fokus S-002:</span>
                    <p className="text-[#28332C]/80 italic">"{q.s002Context}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LEMBAR OBSERVASI PEMBELAJARAN */}
      {activeTab === 'observation' && (
        <div className="space-y-6">
          {/* OBSERVATION FORM HEADER & METADATA */}
          <div className="bg-[#FAF9F6] border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#8DA399]/20">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#28332C] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#8DA399]" />
                  Lembar Observasi Pembelajaran (Siap Isi & Siap Cetak)
                </h2>
                <p className="text-xs text-[#28332C]/70 mt-1">
                  Digunakan selama sesi pembelajaran berlangsung untuk mencatat keterlibatan, pemahaman konsep, strategi penyelesaian, dan respons subjek.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={resetObservationForm}
                  className="px-3 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-[#28332C]/70 hover:bg-neutral-100 transition"
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={downloadObservationSheet}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#8DA399]/40 text-xs font-semibold text-[#28332C] hover:bg-[#8DA399]/15 transition shadow-sm"
                >
                  <Download className="w-4 h-4 text-[#8DA399]" />
                  <span>Unduh Lembar (.txt)</span>
                </button>
              </div>
            </div>

            {/* SUBJECT IDENTITY FIELDS (INTERACTIVE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#28332C]/70 mb-1">
                  Kode Subjek Penelitian
                </label>
                <input
                  type="text"
                  placeholder="Contoh: S-001 atau S-002"
                  value={obsMetadata.subjectCode}
                  onChange={(e) => setObsMetadata({ ...obsMetadata, subjectCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#8DA399]/40 focus:outline-none focus:border-[#D58B68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#28332C]/70 mb-1">
                  Tanggal Pengamatan
                </label>
                <input
                  type="date"
                  value={obsMetadata.date}
                  onChange={(e) => setObsMetadata({ ...obsMetadata, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#8DA399]/40 focus:outline-none focus:border-[#D58B68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#28332C]/70 mb-1">
                  Materi Pokok
                </label>
                <input
                  type="text"
                  value={obsMetadata.topic}
                  onChange={(e) => setObsMetadata({ ...obsMetadata, topic: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#8DA399]/40 focus:outline-none focus:border-[#D58B68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#28332C]/70 mb-1">
                  Nama Pengamat / Observer
                </label>
                <input
                  type="text"
                  value={obsMetadata.observer}
                  onChange={(e) => setObsMetadata({ ...obsMetadata, observer: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#8DA399]/40 focus:outline-none focus:border-[#D58B68]"
                />
              </div>
            </div>
          </div>

          {/* OBSERVATION ASPECTS TABLE / ACCORDION */}
          <div className="space-y-4">
            {OBSERVATION_ASPECTS.map((aspect) => {
              const isOpen = expandedObservations[aspect.id] !== false;
              return (
                <div
                  key={aspect.id}
                  className="bg-white border border-[#8DA399]/30 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleObservationAspect(aspect.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left bg-[#FAF9F6]/60 hover:bg-[#FAF9F6] transition border-b border-[#8DA399]/20"
                  >
                    <div>
                      <span className="text-xs font-serif font-bold text-[#D58B68] uppercase tracking-wider block">
                        Aspek {aspect.id}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#28332C] mt-0.5">
                        {aspect.title}
                      </h3>
                      <p className="text-xs text-[#28332C]/70 mt-1">{aspect.description}</p>
                    </div>
                    {isOpen ? <ChevronDown className="w-5 h-5 text-[#28332C]/60" /> : <ChevronRight className="w-5 h-5 text-[#28332C]/60" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-6 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#8DA399]/30 text-[#28332C]/70">
                            <th className="py-2.5 px-3 w-12 font-bold">No</th>
                            <th className="py-2.5 px-3 font-bold">Indikator Pengamatan</th>
                            <th className="py-2.5 px-3 w-16 text-center font-bold">Ya</th>
                            <th className="py-2.5 px-3 w-16 text-center font-bold">Tidak</th>
                            <th className="py-2.5 px-3 w-72 font-bold">Catatan Pengamatan Lapangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#8DA399]/15">
                          {aspect.indicators.map((ind, idx) => (
                            <tr key={ind.id} className="hover:bg-[#FAF9F6]/40 transition">
                              <td className="py-3 px-3 font-mono font-medium text-[#28332C]/80">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 text-[#28332C] font-medium leading-relaxed">
                                {ind.text}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleObsCheck(ind.id, 'Ya')}
                                  className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition ${
                                    obsChecklist[ind.id] === 'Ya'
                                      ? 'bg-emerald-600 border-emerald-700 text-white font-bold'
                                      : 'border-[#8DA399]/40 bg-white hover:border-emerald-500'
                                  }`}
                                  title="Tandai Ya"
                                >
                                  {obsChecklist[ind.id] === 'Ya' ? '✓' : ''}
                                </button>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleObsCheck(ind.id, 'Tidak')}
                                  className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition ${
                                    obsChecklist[ind.id] === 'Tidak'
                                      ? 'bg-rose-600 border-rose-700 text-white font-bold'
                                      : 'border-[#8DA399]/40 bg-white hover:border-rose-500'
                                  }`}
                                  title="Tandai Tidak"
                                >
                                  {obsChecklist[ind.id] === 'Tidak' ? '✕' : ''}
                                </button>
                              </td>
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  placeholder="Tulis catatan spesifik..."
                                  value={obsNotes[ind.id] || ''}
                                  onChange={(e) => handleObsNoteChange(ind.id, e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-[#8DA399]/30 bg-white text-xs focus:outline-none focus:border-[#8DA399]"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PROSEDUR PENGUMPULAN DATA */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F6] border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-serif font-bold text-[#28332C] flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-[#8DA399]" />
              Prosedur Operasional Standar Pengumpulan Data
            </h2>
            <p className="text-xs text-[#28332C]/70 mt-1 max-w-3xl">
              Protokol pelaksanaan penelitian lapangan yang dijalankan secara terstandardisasi pada subjek Kontrol (S-001) dan subjek Eksperimen (S-002) untuk menjaga validitas internal penelitian.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* S-001 PROCEDURE: KELOMPOK KONTROL */}
            <div className="bg-white border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#8DA399]/20">
                <span className="w-3.5 h-3.5 rounded-full bg-[#8DA399]"></span>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#28332C]">
                    Kelompok Kontrol: {RESEARCH_PROCEDURES.s001_control?.code || 'S-001'}
                  </h3>
                  <span className="text-xs text-[#28332C]/70 block font-medium">
                    {RESEARCH_PROCEDURES.s001_control?.treatment || 'Pembelajaran Tatap Muka Langsung bersama Peneliti'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#28332C]/75 leading-relaxed bg-[#FAF9F6] p-3 rounded-xl border border-[#8DA399]/20">
                {RESEARCH_PROCEDURES.s001_control?.description}
              </p>

              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#28332C]/60 block">
                  Urutan Pelaksanaan Pengumpulan Data:
                </span>
                {(RESEARCH_PROCEDURES.s001_control?.steps || []).map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-3 rounded-xl border border-[#8DA399]/20 hover:bg-[#FAF9F6]/40 transition">
                    <span className="w-6 h-6 rounded-full bg-[#8DA399]/20 text-[#28332C] flex items-center justify-center font-serif font-bold text-xs shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#28332C]">{step.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#8DA399]/15 text-[#28332C] font-medium shrink-0">
                          Tahap {step.step}
                        </span>
                      </div>
                      <p className="text-xs text-[#28332C]/70 leading-relaxed">{step.description}</p>
                      <div className="text-[11px] text-[#28332C]/80 font-medium pt-1 border-t border-[#8DA399]/10">
                        <span className="text-[#8DA399] font-bold">Fokus Aktivitas:</span> {step.activity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* S-002 PROCEDURE: KELOMPOK EKSPERIMEN */}
            <div className="bg-white border border-[#D58B68]/30 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#D58B68]/20">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D58B68]"></span>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#28332C]">
                    Kelompok Eksperimen: {RESEARCH_PROCEDURES.s002_experiment?.code || 'S-002'}
                  </h3>
                  <span className="text-xs text-[#28332C]/70 block font-medium">
                    {RESEARCH_PROCEDURES.s002_experiment?.treatment || 'Pembelajaran Berbantuan NUMORA Space & Pendampingan NORA AI'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#28332C]/75 leading-relaxed bg-[#D58B68]/5 p-3 rounded-xl border border-[#D58B68]/20">
                {RESEARCH_PROCEDURES.s002_experiment?.description}
              </p>

              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#28332C]/60 block">
                  Urutan Pelaksanaan Pengumpulan Data:
                </span>
                {(RESEARCH_PROCEDURES.s002_experiment?.steps || []).map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-3 rounded-xl border border-[#D58B68]/20 hover:bg-[#D58B68]/5 transition">
                    <span className="w-6 h-6 rounded-full bg-[#D58B68]/20 text-[#D58B68] flex items-center justify-center font-serif font-bold text-xs shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#28332C]">{step.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#D58B68]/15 text-[#D58B68] font-medium shrink-0">
                          Tahap {step.step}
                        </span>
                      </div>
                      <p className="text-xs text-[#28332C]/70 leading-relaxed">{step.description}</p>
                      <div className="text-[11px] text-[#28332C]/80 font-medium pt-1 border-t border-[#D58B68]/10">
                        <span className="text-[#D58B68] font-bold">Fokus Aktivitas:</span> {step.activity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DOKUMENTASI, WAKTU PELAKSANAAN & PENYIMPANAN DATA */}
          <div className="bg-white border border-[#8DA399]/30 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#28332C] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#8DA399]" />
              Format Waktu Pelaksanaan & Pencatatan Hasil Penelitian (Dapat Diisi Peneliti)
            </h3>
            <p className="text-xs text-[#28332C]/70">
              Formulir pencatatan operasional untuk mendokumentasikan tanggal pelaksanaan, durasi sesi lapangan nyata, serta lokasi penyimpanan berkas data penelitian.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#8DA399]/30 space-y-3">
                <span className="text-xs font-bold text-[#28332C] block">Log Pelaksanaan Subjek S-001 (Kontrol)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-[#28332C]/70 block font-medium mb-1">Tanggal Sesi</label>
                    <input type="text" placeholder="Contoh: Terlaksana di lapangan" className="w-full px-3 py-1.5 rounded-lg border border-[#8DA399]/30 bg-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#28332C]/70 block font-medium mb-1">Pencatatan Lembar Tes</label>
                    <input type="text" placeholder="10 Butir Terarsip" className="w-full px-3 py-1.5 rounded-lg border border-[#8DA399]/30 bg-white text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#28332C]/70 block font-medium mb-1">Catatan Verifikasi & Dokumentasi S-001</label>
                  <textarea rows="2" placeholder="Tuliskan catatan verifikasi berkas tes evaluasi, wawancara, dan observasi tatap muka..." className="w-full px-3 py-1.5 rounded-lg border border-[#8DA399]/30 bg-white text-xs"></textarea>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#D58B68]/30 space-y-3">
                <span className="text-xs font-bold text-[#28332C] block">Log Pelaksanaan Subjek S-002 (Eksperimen)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-[#28332C]/70 block font-medium mb-1">Tanggal Sesi</label>
                    <input type="text" placeholder="Contoh: Terlaksana di platform" className="w-full px-3 py-1.5 rounded-lg border border-[#D58B68]/30 bg-white text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#28332C]/70 block font-medium mb-1">Log Sistem & Tes</label>
                    <input type="text" placeholder="10 Butir & Aktivitas Tersimpan" className="w-full px-3 py-1.5 rounded-lg border border-[#D58B68]/30 bg-white text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#28332C]/70 block font-medium mb-1">Catatan Verifikasi & Dokumentasi S-002</label>
                  <textarea rows="2" placeholder="Tuliskan catatan verifikasi hasil tes, transkrip wawancara, dan log interaksi NORA AI..." className="w-full px-3 py-1.5 rounded-lg border border-[#D58B68]/30 bg-white text-xs"></textarea>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-[#28332C]/80 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#8DA399] shrink-0 mt-0.5" />
              <div>
                <strong>Rekomendasi Prosedur Penyimpanan Hasil Penelitian:</strong> Seluruh berkas fisik (lembar jawaban tes tertulis, formulir observasi terisi, dan catatan lapangan) diarsipkan dalam map arsip penelitian, sedangkan dokumentasi digital (rekaman audio wawancara, transkrip, dan data log sistem) direkomendasikan untuk disimpan secara terstruktur dan aman pada direktori penelitian yang dilindungi aksesnya.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
