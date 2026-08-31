import crypto from 'crypto';

interface WatchJobState {
  projectId: string;
  url: string;
  ownerId: string;
  consecutiveFailures: number;
  lastRunTimestamp: number;
  lastEvidenceHash?: string;
  isPaused: boolean;
  pauseReason?: string;
}

const watchJobs = new Map<string, WatchJobState>();
const activeWatchLocks = new Set<string>();

const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Computes a SHA-256 fingerprint hash of page DOM / evidence text to detect content changes.
 */
export function computeEvidenceHash(textSummary: string, headingsText: string): string {
  const payload = `${textSummary.trim()}:${headingsText.trim()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Gets or registers a Watch Mode job configuration.
 */
export function getWatchJob(projectId: string, url: string, ownerId: string): WatchJobState {
  const key = `${ownerId}:${projectId}`;
  let job = watchJobs.get(key);
  if (!job) {
    job = {
      projectId,
      url,
      ownerId,
      consecutiveFailures: 0,
      lastRunTimestamp: 0,
      isPaused: false,
    };
    watchJobs.set(key, job);
  }
  return job;
}

/**
 * Verifies if a Watch Mode run can proceed safely.
 * Returns true if allowed, false with reason if locked/paused.
 */
export function canRunWatchMode(
  projectId: string,
  url: string,
  ownerId: string
): { allowed: boolean; reason?: string } {
  const key = `${ownerId}:${projectId}`;
  const job = getWatchJob(projectId, url, ownerId);

  if (job.isPaused) {
    return {
      allowed: false,
      reason: `Watch Mode job is currently paused (${job.pauseReason || 'Credit exhaustion or repeated failure'}).`,
    };
  }

  if (activeWatchLocks.has(key)) {
    return {
      allowed: false,
      reason: `Watch Mode job for ${projectId} is already running in another active execution window.`,
    };
  }

  if (job.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    job.isPaused = true;
    job.pauseReason = `Automatically paused after ${job.consecutiveFailures} consecutive failures.`;
    return {
      allowed: false,
      reason: job.pauseReason,
    };
  }

  return { allowed: true };
}

/**
 * Acquires execution lock for a Watch Mode job.
 */
export function acquireWatchLock(projectId: string, ownerId: string): boolean {
  const key = `${ownerId}:${projectId}`;
  if (activeWatchLocks.has(key)) return false;
  activeWatchLocks.add(key);
  return true;
}

/**
 * Releases execution lock for a Watch Mode job.
 */
export function releaseWatchLock(projectId: string, ownerId: string): void {
  const key = `${ownerId}:${projectId}`;
  activeWatchLocks.delete(key);
}

/**
 * Checks if the fetched site evidence has changed significantly since the last run.
 * Returns true if changed (or first run), false if unchanged (allowing skipping AI pass).
 */
export function hasSiteChanged(
  projectId: string,
  ownerId: string,
  currentHash: string
): boolean {
  const key = `${ownerId}:${projectId}`;
  const job = watchJobs.get(key);
  if (!job || !job.lastEvidenceHash) {
    return true;
  }
  return job.lastEvidenceHash !== currentHash;
}

/**
 * Updates job state on completion or failure.
 */
export function recordWatchJobResult(
  projectId: string,
  ownerId: string,
  success: boolean,
  evidenceHash?: string,
  errorMsg?: string
): void {
  const key = `${ownerId}:${projectId}`;
  const job = watchJobs.get(key);
  if (!job) return;

  job.lastRunTimestamp = Date.now();

  if (success) {
    job.consecutiveFailures = 0;
    if (evidenceHash) {
      job.lastEvidenceHash = evidenceHash;
    }
  } else {
    job.consecutiveFailures += 1;
    if (job.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      job.isPaused = true;
      job.pauseReason = `Paused automatically due to repeated failures: ${errorMsg || 'Pipeline failure'}`;
      console.warn(`[REVO WatchMode] Job ${key} automatically PAUSED after ${MAX_CONSECUTIVE_FAILURES} failures.`);
    }
  }
}

/**
 * Unpauses a paused Watch Mode job (e.g. after user top-up or manual reset).
 */
export function resetWatchJob(projectId: string, ownerId: string): void {
  const key = `${ownerId}:${projectId}`;
  const job = watchJobs.get(key);
  if (job) {
    job.isPaused = false;
    job.consecutiveFailures = 0;
    job.pauseReason = undefined;
    console.log(`[REVO WatchMode] Job ${key} manually reset and unpaused.`);
  }
}
