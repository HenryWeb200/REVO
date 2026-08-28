import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AnalysisDocument, AnalysisDbStatus } from '../../src/types.js';

let supabaseClient: SupabaseClient | null = null;

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

export async function insertSupabaseAnalysis(doc: AnalysisDocument): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client) return false;

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

    if (error) {
      console.warn('[REVO Database] Supabase insert warning (table might need migration):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[REVO Database] Supabase insertion exception:', err);
    return false;
  }
}

export async function updateSupabaseAnalysis(
  id: string,
  status: AnalysisDbStatus,
  partialUpdate?: Partial<AnalysisDocument>
): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client) return false;

  try {
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (partialUpdate?.site) {
      if (partialUpdate.site.title) updatePayload.site_title = partialUpdate.site.title;
      if (partialUpdate.site.type) updatePayload.site_type = partialUpdate.site.type;
      if (partialUpdate.site.primaryGoal) updatePayload.primary_goal = partialUpdate.site.primaryGoal;
    }
    if (partialUpdate?.analysis) {
      updatePayload.analysis_data = partialUpdate.analysis;
    }
    if (partialUpdate?.evidence) {
      updatePayload.evidence_data = partialUpdate.evidence;
    }
    if (partialUpdate?.errors) {
      updatePayload.errors = partialUpdate.errors;
    }
    if (partialUpdate?.metadata) {
      updatePayload.metadata = partialUpdate.metadata;
    }
    if (partialUpdate?.completedAt) {
      updatePayload.completed_at = partialUpdate.completedAt.toISOString();
    }

    const { error } = await client.from('analyses').update(updatePayload).eq('id', id);
    if (error) {
      console.warn('[REVO Database] Supabase update warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[REVO Database] Supabase update exception:', err);
    return false;
  }
}
