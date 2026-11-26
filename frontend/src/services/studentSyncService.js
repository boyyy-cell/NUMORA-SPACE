/**
 * NUMORA Space — Student Persistent Data Synchronization Service (v1.0)
 * Manages multi-device sync, localStorage bootstrap migration, offline cache,
 * and conflict resolution for student learning progression, evaluations, and runner stats.
 */
import { apiService } from './api.js';

export const MIGRATION_STATES = {
  UNMIGRATED: 'UNMIGRATED',
  MIGRATING: 'MIGRATING',
  VERIFIED_MIGRATED: 'VERIFIED_MIGRATED',
};

export const SYNC_STATUS = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  OFFLINE: 'OFFLINE',
  ERROR: 'ERROR',
  BLOCKED: 'BLOCKED', // For S-001 control group
};

export function generateIdempotencyKey(prefix = 'idem') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(36).substring(2, 12);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function getScopedKey(baseKey, user) {
  const identifier = (user?.email || user?.subjectId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${baseKey}_${identifier}`;
}

class StudentSyncService {
  constructor() {
    this.currentStatus = SYNC_STATUS.IDLE;
    this.listeners = new Set();
    this._setupNetworkListeners();
  }

  _setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this._flushPendingQueue();
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify(data) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (e) {
        console.warn('[NUMORA Sync] listener error', e);
      }
    }
  }

  /**
   * Mengambil data tersimpan di local cache siswa.
   */
  getLocalProgress(user) {
    if (!user || typeof window === 'undefined') return [];
    const key = getScopedKey('numora_student_progress', user);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  }

  /**
   * Menyimpan data progres modul ke local cache siswa (union-set: COMPLETED tidak pernah hilang).
   */
  setLocalProgress(user, modulesList) {
    if (!user || typeof window === 'undefined') return;
    const key = getScopedKey('numora_student_progress', user);
    try {
      localStorage.setItem(key, JSON.stringify(modulesList));
    } catch (e) {
      console.warn('[NUMORA Sync] Failed to cache progress locally', e);
    }
  }

  getLocalEvaluations(user) {
    if (!user || typeof window === 'undefined') return [];
    const key = getScopedKey('numora_evaluations_history', user);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  }

  setLocalEvaluations(user, evaluationsList) {
    if (!user || typeof window === 'undefined') return;
    const key = getScopedKey('numora_evaluations_history', user);
    try {
      localStorage.setItem(key, JSON.stringify(evaluationsList));
    } catch (e) {
      console.warn('[NUMORA Sync] Failed to cache evaluations locally', e);
    }
  }

  getLocalRunner(user) {
    if (!user || typeof window === 'undefined') return null;
    const key = getScopedKey('numora_runner_cache', user);
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  setLocalRunner(user, runnerData) {
    if (!user || typeof window === 'undefined') return;
    const key = getScopedKey('numora_runner_cache', user);
    try {
      localStorage.setItem(key, JSON.stringify(runnerData));
    } catch (e) {
      console.warn('[NUMORA Sync] Failed to cache runner data locally', e);
    }
  }

  /**
   * SINKRONISASI AWAL (INITIAL SYNC) & MIGRATION BOOTSTRAP:
   * Dijalankan tepat setelah login siswa berhasil atau saat memuat aplikasi.
   */
  async initializeSync(user) {
    if (!user) return { status: SYNC_STATUS.IDLE };

    // Aturan Riset: S-001 adalah subjek kontrol (tatap muka langsung).
    // DILARANG melakukan sinkronisasi intervensi digital agar data kontrol tidak tercemar.
    if (user.subjectId === 'S-001' || user.role !== 'student') {
      this.currentStatus = SYNC_STATUS.BLOCKED;
      this._notify({ status: SYNC_STATUS.BLOCKED, reason: 'S-001 Control Group / Non-Student' });
      return { status: SYNC_STATUS.BLOCKED };
    }

    this.currentStatus = SYNC_STATUS.SYNCING;
    this._notify({ status: SYNC_STATUS.SYNCING });

    const migrationKey = getScopedKey('numora_migration_status', user);
    const currentMigrationState = localStorage.getItem(migrationKey) || MIGRATION_STATES.UNMIGRATED;

    try {
      // 1. Periksa apakah ada data lama di localStorage yang perlu dimigrasikan
      if (currentMigrationState !== MIGRATION_STATES.VERIFIED_MIGRATED) {
        const legacyModules = this._gatherLegacyModules(user);
        const legacyEvaluations = this._gatherLegacyEvaluations(user);
        const legacyRunner = this._gatherLegacyRunner(user);

        const hasLegacyData = legacyModules.length > 0 || legacyEvaluations.length > 0 || Boolean(legacyRunner);

        if (hasLegacyData) {
          localStorage.setItem(migrationKey, MIGRATION_STATES.MIGRATING);

          const migrationPayload = {
            modules: legacyModules,
            evaluations: legacyEvaluations,
            runner: legacyRunner || {},
          };

          const migrationRes = await apiService.bootstrapMigrateStudentData(migrationPayload);
          if (migrationRes?.status === MIGRATION_STATES.VERIFIED_MIGRATED) {
            localStorage.setItem(migrationKey, MIGRATION_STATES.VERIFIED_MIGRATED);
            this._applyServerStateToLocalCache(user, migrationRes.current_state);
            this.currentStatus = SYNC_STATUS.SYNCED;
            this._notify({ status: SYNC_STATUS.SYNCED, source: 'bootstrap_migration' });
            return { status: SYNC_STATUS.SYNCED, state: migrationRes.current_state };
          }
        } else {
          localStorage.setItem(migrationKey, MIGRATION_STATES.VERIFIED_MIGRATED);
        }
      }

      // 2. Jika sudah bermigrasi atau tidak ada data lama, lakukan Full Sync dari Server
      const serverState = await apiService.getStudentSync();
      this._applyServerStateToLocalCache(user, serverState);

      this.currentStatus = SYNC_STATUS.SYNCED;
      this._notify({ status: SYNC_STATUS.SYNCED, source: 'server_sync' });
      return { status: SYNC_STATUS.SYNCED, state: serverState };
    } catch (error) {
      console.warn('[NUMORA Sync] Server sync unavailable, falling back to local cache', error);
      this.currentStatus = error.isOffline || error.isTimeout ? SYNC_STATUS.OFFLINE : SYNC_STATUS.ERROR;
      this._notify({ status: this.currentStatus, error });
      return { status: this.currentStatus, offlineData: this.getLocalProgress(user) };
    }
  }

  _gatherLegacyModules(user) {
    const list = new Set();
    const keysToCheck = [
      `numora_student_progress_${user.subjectId}`,
      `numora_student_progress_${user.email}`,
      getScopedKey('numora_student_progress', user),
    ];
    for (const k of keysToCheck) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((m) => list.add(m));
          }
        }
      } catch (_) {}
    }
    return Array.from(list);
  }

  _gatherLegacyEvaluations(user) {
    const evals = [];
    const keysToCheck = [
      `numora_evaluation_results_${user.subjectId}`,
      `numora_evaluation_results_${user.email}`,
      getScopedKey('numora_evaluations_history', user),
    ];
    for (const k of keysToCheck) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            evals.push(...parsed);
          } else if (parsed && typeof parsed === 'object') {
            evals.push(parsed);
          }
        }
      } catch (_) {}
    }
    return evals;
  }

  _gatherLegacyRunner(user) {
    try {
      const raw = localStorage.getItem('numora_runner_data_v1');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  _applyServerStateToLocalCache(user, serverState) {
    if (!serverState) return;

    // 1. Modul: Simpan array module_id yang berstatus COMPLETED
    const completedList = (serverState.progress || [])
      .filter((p) => p.status === 'COMPLETED')
      .map((p) => p.module_id);
    this.setLocalProgress(user, completedList);

    // 2. Evaluasi: Simpan riwayat lengkap
    if (Array.isArray(serverState.evaluations)) {
      this.setLocalEvaluations(user, serverState.evaluations);
    }

    // 3. Runner: Simpan stats dan sessions
    const runnerCache = {
      stats: serverState.runner_stats || {},
      sessions: serverState.runner_sessions || [],
    };
    this.setLocalRunner(user, runnerCache);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('numora_sync_applied', { detail: serverState }));
    }
  }

  /**
   * Menyimpan progres penyelesaian modul ke server dan local cache.
   */
  async recordModuleProgress(user, moduleId, status = 'COMPLETED', sliderExplored = 100, timeSpentSeconds = 300) {
    if (!user) return;
    if (user.subjectId === 'S-001') {
      console.warn('[NUMORA Sync] S-001 cannot record digital module progress.');
      return;
    }

    // 1. Update local cache optimistically
    const current = this.getLocalProgress(user);
    if (status === 'COMPLETED' && !current.includes(moduleId)) {
      this.setLocalProgress(user, [...current, moduleId]);
    }

    // 2. Kirim ke backend
    try {
      const res = await apiService.saveStudentProgress({
        module_id: moduleId,
        status,
        slider_explored: sliderExplored,
        time_spent_seconds: timeSpentSeconds,
      });

      // 3. Catat audit trail aktivitas belajar
      apiService.logLearningActivity({
        activity_type: status === 'COMPLETED' ? 'MODULE_COMPLETE' : 'MODULE_VIEW',
        module_or_feature_id: moduleId,
        metadata: { slider_explored: sliderExplored, time_spent_seconds: timeSpentSeconds },
      }).catch(() => {});

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('numora_module_saved', { detail: res }));
      }
      return res;
    } catch (error) {
      console.warn('[NUMORA Sync] Failed to send module progress to server, queued locally', error);
      this._enqueuePending({
        type: 'MODULE_PROGRESS',
        user,
        payload: { module_id: moduleId, status, slider_explored: sliderExplored, time_spent_seconds: timeSpentSeconds },
      });
    }
  }

  /**
   * Menyimpan hasil evaluasi ke server dengan Idempotency Key unik.
   */
  async recordEvaluation(user, evaluationResult) {
    if (!user) return;
    if (user.subjectId === 'S-001') {
      console.warn('[NUMORA Sync] S-001 cannot record digital evaluation.');
      return;
    }

    const idempotencyKey = evaluationResult.idempotency_key || generateIdempotencyKey('eval');
    const totalQuestions = Number(evaluationResult.totalQuestions || evaluationResult.total_questions || 10);
    const correctCount = Number(evaluationResult.correctCount || evaluationResult.correct_count || 0);
    const wrongCount = Number(evaluationResult.wrongCount || evaluationResult.wrong_count || Math.max(0, totalQuestions - correctCount));
    const accuracy = Number(evaluationResult.percentage || evaluationResult.accuracy || Math.round((correctCount / totalQuestions) * 100));

    const payload = {
      idempotency_key: idempotencyKey,
      score: Number(evaluationResult.score || 0),
      accuracy,
      percentage: accuracy,
      total_questions: totalQuestions,
      totalQuestions,
      correct_count: correctCount,
      correctCount,
      wrong_count: wrongCount,
      wrongCount,
      category_breakdown: evaluationResult.categoryBreakdown || evaluationResult.category_breakdown || evaluationResult.categoryStats || {},
      categoryAnalysis: evaluationResult.categoryAnalysis || [],
      detailed_answers: evaluationResult.detailedAnswers || evaluationResult.questionReviews || evaluationResult.detailed_answers || [],
      questionReviews: evaluationResult.questionReviews || evaluationResult.detailedAnswers || evaluationResult.detailed_answers || [],
      completed_at: Math.floor(Date.now() / 1000),
      timestamp: evaluationResult.timestamp || new Date().toISOString()
    };

    // Update local cache optimistically
    const currentEvals = this.getLocalEvaluations(user);
    this.setLocalEvaluations(user, [payload, ...currentEvals]);

    try {
      const res = await apiService.submitEvaluation(payload);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('numora_evaluation_saved', { detail: res }));
      }
      return res;
    } catch (error) {
      console.warn('[NUMORA Sync] Failed to submit evaluation to server, queued locally', error);
      this._enqueuePending({
        type: 'EVALUATION',
        user,
        payload,
      });
      return payload;
    }
  }

  /**
   * Menyimpan sesi NUMORA RUN ke server secara atomik dengan Idempotency Key.
   */
  async recordRunnerSession(user, sessionData) {
    if (!user) return;
    if (user.subjectId === 'S-001') {
      console.warn('[NUMORA Sync] S-001 cannot record runner session.');
      return;
    }

    const idempotencyKey = sessionData.idempotency_key || generateIdempotencyKey('run');
    const payload = {
      idempotency_key: idempotencyKey,
      level: sessionData.level || 'beginner',
      score: Math.round(sessionData.score || 0),
      coins: Math.round(sessionData.coins || 0),
      distance: Math.round(sessionData.distance || 0),
      answered: Math.round(sessionData.answered || 0),
      correct: Math.round(sessionData.correct || 0),
      accuracy: Number(sessionData.accuracy || 0),
      mistakes_count: sessionData.mistakes ? sessionData.mistakes.length : Number(sessionData.mistakes_count || 0),
      created_at: Math.floor(Date.now() / 1000),
    };

    try {
      const res = await apiService.submitRunnerSession(payload);
      const runnerCache = this.getLocalRunner(user) || { stats: {}, sessions: [] };
      runnerCache.stats = res.stats;
      runnerCache.sessions = [res.session, ...(runnerCache.sessions || [])];
      this.setLocalRunner(user, runnerCache);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('numora_runner_saved', { detail: res }));
      }
      return res;
    } catch (error) {
      console.warn('[NUMORA Sync] Failed to record runner session, queued locally', error);
      this._enqueuePending({
        type: 'RUNNER_SESSION',
        user,
        payload,
      });
      return { is_new_high: false, session: payload, stats: {} };
    }
  }

  _enqueuePending(item) {
    if (typeof window === 'undefined' || !item.user) return;
    const key = getScopedKey('numora_pending_queue', item.user);
    try {
      const raw = localStorage.getItem(key);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ ...item, queuedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(queue));
    } catch (e) {
      console.warn('[NUMORA Sync] Failed to enqueue pending request', e);
    }
  }

  async _flushPendingQueue(user = null) {
    if (typeof window === 'undefined') return;
    try {
      const keysToFlush = [];
      if (user) {
        keysToFlush.push(getScopedKey('numora_pending_queue', user));
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('numora_pending_queue_')) {
            keysToFlush.push(k);
          }
        }
      }

      for (const queueKey of keysToFlush) {
        const raw = localStorage.getItem(queueKey);
        if (!raw) continue;
        const queue = JSON.parse(raw);
        if (!Array.isArray(queue) || queue.length === 0) continue;

        const remaining = [];
        for (const item of queue) {
          try {
            if (item.type === 'MODULE_PROGRESS') {
              await apiService.saveStudentProgress(item.payload);
            } else if (item.type === 'EVALUATION') {
              await apiService.submitEvaluation(item.payload);
            } else if (item.type === 'RUNNER_SESSION') {
              await apiService.submitRunnerSession(item.payload);
            }
          } catch (err) {
            // If still offline or network fails, retain in remaining queue
            console.warn('[NUMORA Sync] Flush failed for item, keeping in queue', err);
            remaining.push(item);
          }
        }

        if (remaining.length > 0) {
          localStorage.setItem(queueKey, JSON.stringify(remaining));
        } else {
          localStorage.removeItem(queueKey);
        }
      }
    } catch (e) {
      console.warn('[NUMORA Sync] Error during _flushPendingQueue', e);
    }
  }
}

export const studentSyncService = new StudentSyncService();
