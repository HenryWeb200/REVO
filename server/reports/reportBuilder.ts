import { StructuredAnalysisResponse, WebsiteEvidencePackage } from '../../src/types.js';
import { enrichWithV2Intelligence } from '../intelligence/v2Reasoning.js';

export function buildFinalReport(
  id: string,
  reasoningData: Omit<StructuredAnalysisResponse, 'id' | 'analyzedAt' | 'evidence' | 'status'>,
  evidence: WebsiteEvidencePackage
): StructuredAnalysisResponse {
  // Enrich base reasoning with complete V2 reasoning layers
  const v2Layers = enrichWithV2Intelligence(reasoningData, evidence);

  const defaultWhatRevoSees = {
    summary: `${reasoningData?.siteName || 'The website'} was analyzed via Playwright DOM inspection.`,
    keyObservations: [],
    observedFacts: [],
    inferredIntent: reasoningData?.primaryGoal || 'Visitor engagement',
  };

  const defaultDimension = {
    score: 7.0,
    confidence: 'high' as const,
    reason: 'Standard baseline observation.',
    evidence: [],
  };

  const defaultScores = {
    clarity: defaultDimension,
    creativity: defaultDimension,
    craft: defaultDimension,
    visualHierarchy: defaultDimension,
    brandStrength: defaultDimension,
    usability: defaultDimension,
    convertibility: defaultDimension,
    contentQuality: defaultDimension,
    accessibility: defaultDimension,
    performance: defaultDimension,
    seo: defaultDimension,
    technicalQuality: defaultDimension,
    awardPotential: defaultDimension,
  };

  return {
    id,
    url: evidence.url,
    siteName: reasoningData?.siteName || 'Website',
    analyzedAt: new Date().toISOString(),
    siteType: reasoningData?.siteType || 'digital product',
    primaryGoal: reasoningData?.primaryGoal || 'Visitor conversion',
    goalConfidence: typeof reasoningData?.goalConfidence === 'number' ? reasoningData.goalConfidence : 8,
    whatRevoSees: reasoningData?.whatRevoSees || defaultWhatRevoSees,
    whyItWorks: reasoningData?.whyItWorks || [],
    whereItBreaks: reasoningData?.whereItBreaks || [],
    scores: reasoningData?.scores || defaultScores,
    topOpportunities: reasoningData?.topOpportunities || [],
    overallDiagnosis: reasoningData?.overallDiagnosis || '',
    evidence,
    status: 'success',

    // V2 Reasoning Modules
    awardIntelligence: v2Layers.awardIntelligence,
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

