import { AnalysisDocument, AnalysisDbStatus } from '../../src/types.js';
import {
  insertSupabaseAnalysis,
  updateSupabaseAnalysis,
  getSupabaseAnalysis,
  isSupabaseConfigured,
  DatabaseOperationResult,
} from './supabase.js';

// In-Memory store (active across server lifecycle)
const memoryStore = new Map<string, AnalysisDocument>();

export async function initStorage(): Promise<void> {
  if (isSupabaseConfigured()) {
    console.log('[REVO Storage] Cloud persistence via Supabase active.');
  } else {
    console.log('[REVO Storage] Supabase credentials not found. In-memory persistence active.');
  }
}

export interface StorageOperationResult {
  recordId: string;
  persistedToCloud: boolean;
  cloudReason?: string;
}

/**
 * Creates an initial analysis record with unique ID, timestamps, ownerId, and status.
 * Writes to in-memory store immediately and synchronously checks Supabase persistence status.
 */
export async function createAnalysisRecord(
  url: string,
  normalizedUrl: string,
  ownerId?: string,
  recordIdOverride?: string
): Promise<StorageOperationResult> {
  const recordId = recordIdOverride || ('revo_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7));
  const now = new Date();

  const doc: AnalysisDocument = {
    id: recordId,
    _id: recordId,
    ownerId: ownerId || undefined,
    url,
    normalizedUrl,
    status: 'queued',
    attemptCount: 1,
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    site: {
      title: '',
      description: '',
      type: 'Web Experience',
      primaryGoal: 'Pending Observation',
    },
    evidence: {},
  };

  memoryStore.set(recordId, doc);

  let persistedToCloud = false;
  let cloudReason: string | undefined;

  if (isSupabaseConfigured()) {
    const dbRes = await insertSupabaseAnalysis(doc);
    persistedToCloud = dbRes.success;
    if (!dbRes.success) {
      cloudReason = dbRes.error;
    }
  } else {
    cloudReason = 'SUPABASE_NOT_CONFIGURED';
  }

  return {
    recordId,
    persistedToCloud,
    cloudReason,
  };
}

/**
 * Updates status, timing metrics, and analysis results for a job.
 */
export async function updateAnalysisStatus(
  id: string,
  status: AnalysisDbStatus,
  partialUpdate?: Partial<AnalysisDocument>
): Promise<{ persistedToCloud: boolean; cloudReason?: string }> {
  const now = new Date();
  const updatePayload = {
    ...partialUpdate,
    status,
    updatedAt: now,
  };

  const existing = memoryStore.get(id);
  if (existing) {
    memoryStore.set(id, {
      ...existing,
      ...updatePayload,
      site: {
        ...existing.site,
        ...(partialUpdate?.site || {}),
      },
      evidence: {
        ...existing.evidence,
        ...(partialUpdate?.evidence || {}),
      },
    });
  }

  let persistedToCloud = false;
  let cloudReason: string | undefined;

  if (isSupabaseConfigured()) {
    const dbRes = await updateSupabaseAnalysis(id, status, partialUpdate);
    persistedToCloud = dbRes.success;
    if (!dbRes.success) {
      cloudReason = dbRes.error;
    }
  } else {
    cloudReason = 'SUPABASE_NOT_CONFIGURED';
  }

  return {
    persistedToCloud,
    cloudReason,
  };
}

/**
 * Retrieves an analysis record by ID with authorization verification.
 */
export async function getAnalysisRecord(
  id: string,
  requestingUserId?: string
): Promise<AnalysisDocument | null> {
  let doc: AnalysisDocument | null = memoryStore.get(id) || null;

  if (!doc && isSupabaseConfigured()) {
    const { doc: cloudDoc } = await getSupabaseAnalysis(id);
    if (cloudDoc) {
      doc = cloudDoc;
      memoryStore.set(id, doc);
    }
  }

  if (!doc) return null;

  // Row Level Security Check: If record has a specific owner, verify requesting user matches owner
  if (doc.ownerId && doc.ownerId !== 'guest_default') {
    if (!requestingUserId || doc.ownerId !== requestingUserId.trim().toLowerCase()) {
      throw new Error('Access denied: You do not have permission to view this analysis.');
    }
  }

  return doc;
}
