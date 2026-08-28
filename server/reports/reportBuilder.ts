import { StructuredAnalysisResponse, WebsiteEvidencePackage } from '../../src/types.js';
import { enrichWithV2Intelligence } from '../intelligence/v2Reasoning.js';

export function buildFinalReport(
  id: string,
  reasoningData: Omit<StructuredAnalysisResponse, 'id' | 'analyzedAt' | 'evidence' | 'status'>,
  evidence: WebsiteEvidencePackage
): StructuredAnalysisResponse {
  // Enrich base reasoning with complete V2 reasoning layers
  const v2Layers = enrichWithV2Intelligence(reasoningData, evidence);

  return {
    id,
    url: evidence.url,
    siteName: reasoningData.siteName,
    analyzedAt: new Date().toISOString(),
    siteType: reasoningData.siteType,
    primaryGoal: reasoningData.primaryGoal,
    goalConfidence: reasoningData.goalConfidence,
    whatRevoSees: reasoningData.whatRevoSees,
    whyItWorks: reasoningData.whyItWorks,
    whereItBreaks: reasoningData.whereItBreaks,
    scores: reasoningData.scores,
    topOpportunities: reasoningData.topOpportunities,
    overallDiagnosis: reasoningData.overallDiagnosis,
    evidence,
    status: 'success',

    // V2 Reasoning Modules
    executiveSummary: v2Layers.executiveSummary,
    designDna: v2Layers.designDna,
    familiarity: v2Layers.familiarity,
    showMeWhy: v2Layers.showMeWhy,
    rootCauses: v2Layers.rootCauses,
    issueClusters: v2Layers.issueClusters,
    quickWins: v2Layers.quickWins,
    roadmapTiers: v2Layers.roadmapTiers,
    varietyOptions: v2Layers.varietyOptions,
    designNew: v2Layers.designNew,
    aiInstructions: v2Layers.aiInstructions,
    designBrief: v2Layers.designBrief,
  };
}

