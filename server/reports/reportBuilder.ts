import { StructuredAnalysisResponse, WebsiteEvidencePackage } from '../../src/types.js';

export function buildFinalReport(
  id: string,
  reasoningData: Omit<StructuredAnalysisResponse, 'id' | 'analyzedAt' | 'evidence' | 'status'>,
  evidence: WebsiteEvidencePackage
): StructuredAnalysisResponse {
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
  };
}
