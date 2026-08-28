import { AnalysisDocument, AnalysisDbStatus, StructuredAnalysisResponse } from '../../src/types.js';
import { insertSupabaseAnalysis, updateSupabaseAnalysis, getSupabaseAdminClient } from './supabase.js';

// In-Memory store
const memoryStore = new Map<string, AnalysisDocument>();

export async function initStorage(): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    console.log('[REVO Storage] Cloud persistence via Supabase enabled.');
  } else {
    console.log('[REVO Storage] In-memory persistence enabled.');
  }
}

/**
 * Creates an initial analysis record with unique ID, timestamps, ownerId, and status.
 */
export async function createAnalysisRecord(
  url: string,
  normalizedUrl: string,
  ownerId?: string,
  recordIdOverride?: string
): Promise<string> {
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

  // Async persist to Supabase if configured
  await insertSupabaseAnalysis(doc).catch(() => {});

  return recordId;
}

/**
 * Updates status, timing metrics, and analysis results for a job.
 */
export async function updateAnalysisStatus(
  id: string,
  status: AnalysisDbStatus,
  partialUpdate?: Partial<AnalysisDocument>
): Promise<void> {
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

  await updateSupabaseAnalysis(id, status, partialUpdate).catch(() => {});
}

/**
 * Retrieves an analysis record by ID with authorization verification.
 */
export async function getAnalysisRecord(
  id: string,
  requestingUserId?: string
): Promise<AnalysisDocument | null> {
  let doc: AnalysisDocument | null = memoryStore.get(id) || null;

  if (!doc) {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (data && !error) {
          doc = {
            id: data.id,
            _id: data.id,
            ownerId: data.owner_id,
            url: data.url,
            normalizedUrl: data.normalized_url,
            status: data.status,
            attemptCount: data.attempt_count || 1,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            startedAt: new Date(data.started_at),
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            site: {
              title: data.site_title || '',
              description: data.site_description || '',
              type: data.site_type || 'Web Experience',
              primaryGoal: data.primary_goal || '',
            },
            evidence: data.evidence_data || {},
            analysis: data.analysis_data || undefined,
            errors: data.errors || [],
            metadata: data.metadata || {},
          };
          memoryStore.set(id, doc);
        }
      } catch (err) {
        console.warn('[REVO Storage] Supabase read exception:', err);
      }
    }
  }

  if (!doc) return null;

  // Row Level Security Check: If record has an owner and a requesting user is supplied, verify match
  if (doc.ownerId && requestingUserId && doc.ownerId !== requestingUserId) {
    throw new Error('Access denied: You do not have permission to view this analysis.');
  }

  return doc;
}
