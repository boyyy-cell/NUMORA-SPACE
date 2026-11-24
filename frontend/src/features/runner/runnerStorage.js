/**
 * NUMORA RUN — Client Local Storage Manager
 * Mencatat skor tertinggi, statistik permainan, dan histori belajar secara jujur di localStorage.
 * Tidak mencemari atau memalsukan data penelitian.
 */

import { studentSyncService } from '../../services/studentSyncService.js';

const STORAGE_KEY = 'numora_runner_data_v1';

function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('numora_auth_session') || sessionStorage.getItem('numora_auth_session');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

const DEFAULT_DATA = {
  highScores: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  },
  totalGames: 0,
  totalCoins: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  recentSessions: [],
};

export function getRunnerStats() {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const user = getCurrentUser();
    if (user) {
      const scoped = studentSyncService.getLocalRunner(user);
      if (scoped && scoped.stats && typeof scoped.stats.total_games === 'number') {
        return {
          ...DEFAULT_DATA,
          highScores: {
            beginner: scoped.stats.high_score_beginner || 0,
            intermediate: scoped.stats.high_score_intermediate || 0,
            advanced: scoped.stats.high_score_advanced || 0,
            expert: scoped.stats.high_score_expert || 0,
          },
          totalGames: scoped.stats.total_games || 0,
          totalCoins: scoped.stats.total_coins || 0,
          totalAnswered: scoped.stats.total_math_answered || 0,
          totalCorrect: scoped.stats.total_math_correct || 0,
          recentSessions: Array.isArray(scoped.sessions) ? scoped.sessions : [],
        };
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DATA,
      ...parsed,
      highScores: {
        ...DEFAULT_DATA.highScores,
        ...(parsed.highScores || {}),
      },
      recentSessions: Array.isArray(parsed.recentSessions) ? parsed.recentSessions : [],
    };
  } catch (e) {
    console.warn('Failed to parse runner stats from localStorage:', e);
    return DEFAULT_DATA;
  }
}

export function saveRunnerSession({
  level = 'beginner',
  score = 0,
  coins = 0,
  distance = 0,
  answered = 0,
  correct = 0,
  accuracy = 0,
  mistakes = [],
}) {
  if (typeof window === 'undefined') return;
  try {
    const current = getRunnerStats();

    // Periksa apakah ini rekor baru untuk level tertentu
    const oldHigh = current.highScores[level] || 0;
    const isNewHigh = score > oldHigh;
    if (isNewHigh) {
      current.highScores[level] = score;
    }

    current.totalGames += 1;
    current.totalCoins += coins;
    current.totalAnswered += answered;
    current.totalCorrect += correct;

    const sessionRecord = {
      id: `run_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      score,
      coins,
      distance: Math.round(distance),
      answered,
      correct,
      accuracy,
      isNewHigh,
      mistakesCount: mistakes.length,
    };

    // Simpan 10 sesi terakhir di local storage lama
    current.recentSessions = [sessionRecord, ...current.recentSessions].slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

    // Sinkronisasi persisten ke database server (seluruh sesi disimpan permanen)
    const user = getCurrentUser();
    if (user && user.subjectId !== 'S-001') {
      studentSyncService.recordRunnerSession(user, {
        level,
        score,
        coins,
        distance,
        answered,
        correct,
        accuracy,
        mistakes,
      });
    }

    return { isNewHigh, currentHighScore: Math.max(score, oldHigh) };
  } catch (e) {
    console.warn('Failed to save runner session to localStorage:', e);
    return { isNewHigh: false, currentHighScore: score };
  }
}

export function getRunnerHighScore(level = 'beginner') {
  const stats = getRunnerStats();
  return stats.highScores[level] || 0;
}

