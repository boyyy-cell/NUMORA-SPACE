import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  History, 
  CheckCircle, 
  Flame, 
  HelpCircle,
  BookOpen
} from 'lucide-react';
import NumoraRunner3D from '../features/runner/NumoraRunner3D';
import { getRunnerStats } from '../features/runner/runnerStorage';

export default function NumoraRunPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getRunnerStats());
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F5EF] text-[#28332C]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E1E5DC] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-[#707A70] hover:text-[#28332C] hover:bg-[#F6F5EF] rounded-xl transition flex items-center gap-1.5 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
          </button>
          <div className="h-4 w-[1px] bg-[#E1E5DC] hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#355B45] text-white flex items-center justify-center font-bold">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#28332C] leading-none">
                NUMORA <span className="text-[#355B45]">RUN</span>
              </h1>
              <span className="text-[10px] text-[#707A70] font-medium">Algebra Endless Runner</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F5EF] border border-[#E1E5DC] text-[#28332C]">
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Rekor: {Math.max(...Object.values(stats?.highScores || { beginner: 0 })).toLocaleString('id-ID')}</span>
          </div>
          <button
            onClick={() => navigate('/lab')}
            className="px-3 py-1.5 rounded-full bg-[#355B45]/10 text-[#355B45] hover:bg-[#355B45] hover:text-white transition text-xs font-bold flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buka Algebra Lab</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* The 3D Runner Stage */}
        <section className="bg-white rounded-3xl p-3 sm:p-5 border border-[#E1E5DC] shadow-sm">
          <NumoraRunner3D onBackToDashboard={() => navigate('/dashboard')} />
        </section>

        {/* Gameplay Guide & Socratic Math Concept */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E1E5DC] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#355B45]/10 text-[#355B45] flex items-center justify-center font-bold mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-[#28332C] mb-1">Kendali 3 Jalur & Aksi</h3>
            <p className="text-xs text-[#707A70] leading-relaxed">
              Gunakan panah <strong>Kiri/Kanan</strong> untuk berpindah jalur, <strong>Atas/Spasi</strong> untuk melompati rintangan rendah, dan <strong>Bawah</strong> untuk meluncur merunduk melewati palang tinggi.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E1E5DC] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#D58B68]/15 text-[#D58B68] flex items-center justify-center font-bold mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-[#28332C] mb-1">Gerbang Tantangan Aljabar</h3>
            <p className="text-xs text-[#707A70] leading-relaxed">
              Setiap beberapa ratus meter muncul Gerbang Aljabar. Jawab 4 opsi pilihan ganda dalam 10 detik untuk membuka gerbang dan melipatgandakan poin skor combo!
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E1E5DC] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#A7BCA8]/30 text-[#355B45] flex items-center justify-center font-bold mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-[#28332C] mb-1">Umpan Balik Socratic NORA</h3>
            <p className="text-xs text-[#707A70] leading-relaxed">
              Jika salah menjawab atau waktu habis, NORA langsung memberikan petunjuk ringkas 1–2 kalimat agar kamu memahami pola dan konsep aljabarnya.
            </p>
          </div>
        </section>

        {/* Histori Belajar & Sesi Terakhir (Jujur di LocalStorage) */}
        {stats && stats.recentSessions && stats.recentSessions.length > 0 && (
          <section className="bg-white rounded-2xl p-5 border border-[#E1E5DC] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#355B45]" />
                <h3 className="text-sm font-bold text-[#28332C]">Histori Lari & Belajar Terakhir</h3>
              </div>
              <span className="text-xs text-[#707A70]">Tersimpan lokal di perambanmu</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E1E5DC] text-[#707A70]">
                    <th className="py-2 font-bold">Waktu</th>
                    <th className="py-2 font-bold">Level</th>
                    <th className="py-2 font-bold">Skor</th>
                    <th className="py-2 font-bold">Jarak</th>
                    <th className="py-2 font-bold">Koin</th>
                    <th className="py-2 font-bold">Akurasi Soal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E5DC]/60">
                  {stats.recentSessions.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-[#F6F5EF]/60 transition">
                      <td className="py-2.5 text-[#707A70]">
                        {new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 capitalize font-semibold text-[#28332C]">{s.level}</td>
                      <td className="py-2.5 font-bold text-[#355B45]">{s.score.toLocaleString('id-ID')}</td>
                      <td className="py-2.5">{s.distance} m</td>
                      <td className="py-2.5 text-[#D97706] font-semibold">{s.coins}</td>
                      <td className="py-2.5 font-medium">
                        {s.answered > 0 ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            s.accuracy >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.accuracy}% ({s.correct}/{s.answered})
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

