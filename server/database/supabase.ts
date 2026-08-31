import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AnalysisDocument, AnalysisDbStatus } from '../../src/types.js';

let supabaseClient: SupabaseClient | null = null;
let isAnalysesTableAvailable: boolean | null = null;
let lastTableCheckTime = 0;
const TABLE_CHECK_INTERVAL_MS = 60000; // Check table availability at most once a minute if missing

export interface DatabaseOperationResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

/**
 * Checks if Supabase server-side credentials are present in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Checks if the public.analyses table exists in the Supabase database.
 */
export async function checkAnalysesTableExists(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  
  const now = Date.now();
  if (isAnalysesTableAvailable === true) return true;
  if (isAnalysesTableAvailable === false && now - lastTableCheckTime < TABLE_CHECK_INTERVAL_MS) {
    return false;
  }

  const client = getSupabaseAdminClient();
  if (!client) return false;

  lastTableCheckTime = now;
  try {
    const { error } = await client.from('analyses').select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      if (isAnalysesTableAvailable !== false) {
        console.log('[REVO Database] Supabase table `public.analyses` not found in schema cache. Using high-performance in-memory storage. (Run /supabase/schema.sql in Supabase SQL Editor to enable cloud sync)');
      }
      isAnalysesTableAvailable = false;
      return false;
    }
    
    if (!error) {
      if (!isAnalysesTableAvailable) {
        console.log('[REVO Database] Supabase table `public.analyses` verified and ready for cloud persistence.');
      }
      isAnalysesTableAvailable = true;
      return true;
    }

    return false;
  } catch {
    isAnalysesTableAvailable = false;
    return false;
  }
}

/**
 * Initializes the Supabase client using server-side service role key.
 * CRITICAL: The service role key is strictly retained in server-side memory and never exposed to the client.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    try {
      supabaseClient = createClient(url, serviceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('[REVO Database] Supabase Server-Side Admin Client Initialized.');
      return supabaseClient;
    } catch (err) {
      console.warn('[REVO Database] Failed to initialize Supabase client:', err);
    }
  }

  return null;
}

/**
 * Inserts a new analysis document into public.analyses.
 * Accurately logs SUCCESS vs FAILED based on actual PostgREST / database responses.
 */
export async function insertSupabaseAnalysis(doc: AnalysisDocument): Promise<DatabaseOperationResult> {
  const start = Date.now();
  const client = getSupabaseAdminClient();

  if (!client) {
    return {
      success: false,
      durationMs: 0,
      error: 'Supabase credentials not configured in environment',
    };
  }

  // Pre-check table availability to avoid throwing PostgREST schema 404s
  const tableExists = await checkAnalysesTableExists();
  if (!tableExists) {
    return {
      success: false,
      durationMs: Date.now() - start,
      error: "Table 'public.analyses' has not been created yet in Supabase (run /supabase/schema.sql)",
    };
  }

  try {
    const { error } = await client.from('analyses').insert({
      id: doc.id || doc._id,
      owner_id: doc.ownerId || null,
      url: doc.url,
      normalized_url: doc.normalizedUrl,
      status: doc.status,
      attempt_count: doc.attemptCount,
      site_title: doc.site.title,
      site_description: doc.site.description,
      site_type: doc.site.type,
      primary_goal: doc.site.primaryGoal,
      evidence_data: doc.evidence,
      analysis_data: doc.analysis || null,
      errors: doc.errors || [],
      metadata: doc.metadata || {},
      created_at: doc.createdAt.toISOString(),
      updated_at: doc.updatedAt.toISOString(),
      started_at: doc.startedAt.toISOString(),
      completed_at: doc.completedAt ? doc.completedAt.toISOString() : null,
    });

    const durationMs = Date.now() - start;

    if (error) {
      if (error.code === 'PGRST205') {
        isAnalysesTableAvailable = false;
      }
      console.log(`[REVO Database] operation=INSERT status=FAILED duration=${durationMs}ms id=${doc.id || doc._id} error="${error.message}" (code: ${error.code})`);
      return {
        success: false,
        durationMs,
        error: error.message,
      };
    }

    console.log(`[REVO Database] operation=INSERT status=SUCCESS duration=${durationMs}ms id=${doc.id || doc._id}`);
    return {
      success: true,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.log(`[REVO Database] operation=INSERT status=FAILED duration=${durationMs}ms id=${doc.id || doc._id} error="${errorMsg}"`);
    return {
      success: false,
      durationMs,
      error: errorMsg,
    };
  }
}

/**
 * Updates status and fields for an existing analysis in public.analyses.
 */
export async function updateSupabaseAnalysis(
  id: string,
  status: AnalysisDbStatus,
  partialUpdate?: Partial<AnalysisDocument>
): Promise<DatabaseOperationResult> {
  const start = Date.now();
  const client = getSupabaseAdminClient();

  if (!client) {
    return {
      success: false,
      durationMs: 0,
      error: 'Supabase credentials not configured in environment',
    };
  }

  // Pre-check table availability
  const tableExists = await checkAnalysesTableExists();
  if (!tableExists) {
    return {
      success: false,
      durationMs: Date.now() - start,
      error: "Table 'public.analyses' has not been created yet in Supabase (run /supabase/schema.sql)",
    };
  }

  try {
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (partialUpdate?.site) {
      if (partialUpdate.site.title !== undefined) updatePayload.site_title = partialUpdate.site.title;
      if (partialUpdate.site.description !== undefined) updatePayload.site_description = partialUpdate.site.description;
      if (partialUpdate.site.type !== undefined) updatePayload.site_type = partialUpdate.site.type;
      if (partialUpdate.site.primaryGoal !== undefined) updatePayload.primary_goal = partialUpdate.site.primaryGoal;
    }
    if (partialUpdate?.analysis !== undefined) {
      updatePayload.analysis_data = partialUpdate.analysis;
    }
    if (partialUpdate?.evidence !== undefined) {
      updatePayload.evidence_data = partialUpdate.evidence;
    }
    if (partialUpdate?.errors !== undefined) {
      updatePayload.errors = partialUpdate.errors;
    }
    if (partialUpdate?.metadata !== undefined) {
      updatePayload.metadata = partialUpdate.metadata;
    }
    if (partialUpdate?.completedAt !== undefined) {
      updatePayload.completed_at = partialUpdate.completedAt ? partialUpdate.completedAt.toISOString() : null;
    }

    const { error } = await client.from('analyses').update(updatePayload).eq('id', id);
    const durationMs = Date.now() - start;

    if (error) {
      console.log(`[REVO Database] operation=UPDATE status=FAILED duration=${durationMs}ms id=${id} error="${error.message}" (code: ${error.code})`);
      return {
        success: false,
        durationMs,
        error: error.message,
      };
    }

    console.log(`[REVO Database] operation=UPDATE status=SUCCESS duration=${durationMs}ms id=${id} newStatus=${status}`);
    return {
      success: true,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.log(`[REVO Database] operation=UPDATE status=FAILED duration=${durationMs}ms id=${id} error="${errorMsg}"`);
    return {
      success: false,
      durationMs,
      error: errorMsg,
    };
  }
}

/**
 * Retrieves an analysis record by ID from Supabase.
 */
export async function getSupabaseAnalysis(id: string): Promise<{
  doc: AnalysisDocument | null;
  result: DatabaseOperationResult;
}> {
  const start = Date.now();
  const client = getSupabaseAdminClient();

  if (!client) {
    return {
      doc: null,
      result: {
        success: false,
        durationMs: 0,
        error: 'Supabase credentials not configured in environment',
      },
    };
  }

  const tableExists = await checkAnalysesTableExists();
  if (!tableExists) {
    return {
      doc: null,
      result: {
        success: false,
        durationMs: Date.now() - start,
        error: "Table 'public.analyses' has not been created yet in Supabase (run /supabase/schema.sql)",
      },
    };
  }

  try {
    const { data, error } = await client
      .from('analyses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const durationMs = Date.now() - start;

    if (error) {
      console.log(`[REVO Database] operation=SELECT status=FAILED duration=${durationMs}ms id=${id} error="${error.message}" (code: ${error.code})`);
      return {
        doc: null,
        result: {
          success: false,
          durationMs,
          error: error.message,
        },
      };
    }

    if (!data) {
      console.log(`[REVO Database] operation=SELECT status=SUCCESS duration=${durationMs}ms id=${id} found=false`);
      return {
        doc: null,
        result: {
          success: true,
          durationMs,
        },
      };
    }

    console.log(`[REVO Database] operation=SELECT status=SUCCESS duration=${durationMs}ms id=${id} found=true`);

    const doc: AnalysisDocument = {
      id: data.id,
      _id: data.id,
      ownerId: data.owner_id || undefined,
      url: data.url,
      normalizedUrl: data.normalized_url,
      status: data.status,
      attemptCount: data.attempt_count,
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
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    };

    return {
      doc,
      result: {
        success: true,
        durationMs,
      },
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.log(`[REVO Database] operation=SELECT status=FAILED duration=${durationMs}ms id=${id} error="${errorMsg}"`);
    return {
      doc: null,
      result: {
        success: false,
        durationMs,
        error: errorMsg,
      },
    };
  }
}
