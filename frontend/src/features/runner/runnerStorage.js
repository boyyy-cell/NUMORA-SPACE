/**
 * NUMORA RUN — Client Local Storage Manager
 * Mencatat skor tertinggi, statistik permainan, dan histori belajar secara jujur di localStorage.
 * Tidak mencemari atau memalsukan data penelitian.
 */

const STORAGE_KEY = 'numora_runner_data_v1';

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

    // Simpan 10 sesi terakhir
    current.recentSessions = [sessionRecord, ...current.recentSessions].slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
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

