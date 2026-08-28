export type AnalysisState = 
  | 'IDLE'
  | 'VALIDATING'
  | 'OBSERVING'
  | 'READING'
  | 'MEASURING'
  | 'REASONING'
  | 'SYNTHESIZING'
  | 'COMPLETE'
  | 'ERROR';

export type AnalysisDbStatus =
  | 'queued'
  | 'observing'
  | 'measuring'
  | 'reasoning'
  | 'composing'
  | 'completed'
  | 'failed'
  | 'timed_out'
  | 'partial';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DimensionScore {
  score: number; // 0.0 - 10.0
  confidence: ConfidenceLevel;
  reason: string;
  evidence: string[];
}

export interface WhyItWorksItem {
  title: string;
  explanation: string;
  evidence: string[];
  observedFact?: string;
  inferredImpact?: string;
  showMeWhyId?: string;
}

export interface WhereItBreaksItem {
  title: string;
  explanation: string;
  evidence: string[];
  observedFriction?: string;
  inferredRisk?: string;
  rootCauseId?: string;
  showMeWhyId?: string;
}

export interface PriorityOpportunity {
  priority: number;
  problem: string;
  whyItMatters: string;
  recommendation: string;
  expectedEffect: string;
  tier?: 'immediate' | 'high_impact' | 'structural' | 'experimental';
  effort?: 'Low' | 'Medium' | 'High';
  confidence?: ConfidenceLevel;
}

export interface RevoAnalysisScores {
  clarity: DimensionScore;
  creativity: DimensionScore;
  craft: DimensionScore;
  visualHierarchy: DimensionScore;
  brandStrength: DimensionScore;
  usability: DimensionScore;
  convertibility: DimensionScore;
  contentQuality: DimensionScore;
  accessibility: DimensionScore;
  performance: DimensionScore;
  seo: DimensionScore;
  technicalQuality: DimensionScore;
  awardPotential: DimensionScore;
}

export interface WhatRevoSees {
  summary: string;
  keyObservations: string[];
  observedFacts: string[];
  inferredIntent: string;
}

export interface InitialVsRenderedStats {
  initialHtml: {
    headingsCount: number;
    buttonsCount: number;
    linksCount: number;
    imagesCount: number;
    scriptsCount: number;
  };
  renderedDom: {
    headingsCount: number;
    buttonsCount: number;
    linksCount: number;
    imagesCount: number;
  };
  isClientRenderedDominant: boolean;
}

export interface WebsiteEvidencePackage {
  url: string;
  resolvedUrl: string;
  title: string;
  metaDescription: string;
  viewport: { width: number; height: number };
  headings: { level: string; text: string }[];
  primaryCtas: string[];
  visibleTextSummary: string;
  navigationItems: string[];
  totalButtons: number;
  totalLinks: number;
  totalImages: number;
  dominantColors: string[];
  consoleErrors: string[];
  loadTimeMs: number;
  initialVsRendered?: InitialVsRenderedStats;
  pageSpeedMetrics?: {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
    fcp?: string;
    lcp?: string;
    cls?: string;
  };
  screenshotDesktopBase64?: string;
  screenshotFullBase64?: string;
}

export interface AnalysisProcessingTimings {
  queue?: number;
  browserLaunch?: number;
  navigation?: number;
  evidenceCollection?: number;
  diagnosticTasks?: number;
  gemini?: number;
  synthesis?: number;
  dbPersistence?: number;
  totalDurationMs?: number;
}

// ═══════════════════════════════════════════════════════════════════════
// REVO V2 EXPANDED DOMAIN MODELS
// ═══════════════════════════════════════════════════════════════════════

export interface ExecutiveSummaryV2 {
  overallHealth: string;
  biggestStrength: string;
  biggestWeakness: string;
  biggestOpportunity: string;
  mostSignificantTechnicalRisk: string;
  designDnaSummary: string;
  theSoWhatTakeaway: string;
}

export interface DesignDnaV2 {
  typography: {
    style: string;
    headingHierarchy: string;
    contrast: string;
    rhythm: string;
  };
  geometry: {
    cornerRadius: string;
    cardStyle: string;
    borderTreatment: string;
  };
  density: {
    level: 'spacious' | 'balanced' | 'compact' | 'dense';
    spacingRhythm: string;
  };
  composition: {
    layoutPattern: string;
    focalBalance: string;
    negativeSpaceUsage: string;
  };
  colorProfile: {
    mode: 'dark' | 'light' | 'hybrid';
    dominantPalette: string[];
    accentStrategy: string;
  };
  motion: {
    presence: string;
    interactionStyle: string;
  };
  visualTone: {
    adjectives: string[];
    archetype: string;
  };
  fingerprintBadge: string;
}

export interface FamiliarityAnalysisV2 {
  score: number; // 0.0 - 10.0 (10 = highly distinctive, 1 = generic template)
  classification: 'distinctive' | 'balanced' | 'conventional' | 'template-like';
  pros: string;
  cons: string;
  overusedPatterns: string[];
  distinctiveElements: string[];
  recommendation: string;
}

export interface ShowMeWhyItemV2 {
  id: string;
  claim: string;
  category: 'hierarchy' | 'conversion' | 'performance' | 'craft' | 'typography' | 'accessibility';
  observedProof: string[];
  metricMeasurement?: string;
  affectedRegion: {
    label: string;
    cssTarget?: string;
    viewportDescription: string;
  };
  reasoningChain: {
    problem: string;
    evidence: string;
    whyItMatters: string;
    rootCause: string;
    recommendedChange: string;
    expectedEffect: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  };
  confidence: ConfidenceLevel;
}

export interface RootCauseNodeV2 {
  id: string;
  title: string;
  category: 'technical' | 'visual' | 'ux' | 'content';
  type: 'root_cause' | 'intermediate_friction' | 'surface_symptom';
  description: string;
  evidence: string;
  downstreamEffects: string[];
}

export interface IssueClusterV2 {
  id: string;
  rootIssue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: ConfidenceLevel;
  symptoms: string[];
  technicalVisualRelationship?: string;
  recommendedRootFix: string;
  expectedResult: string;
}

export interface QuickWinItemV2 {
  id: string;
  issue: string;
  impact: 'High' | 'Medium';
  effort: 'Minimal' | 'Low';
  confidence: ConfidenceLevel;
  fix: string;
  expectedResult: string;
}

export interface VarietyOptionV2 {
  id: string;
  name: 'Current' | 'Minimal' | 'Editorial' | 'Bold' | 'Experimental';
  tagline: string;
  keyChanges: string[];
  preservedIdentity: string[];
  aestheticDirection: string;
  recommendedWhen: string;
}

export interface DesignNewDirectionV2 {
  visionTitle: string;
  visionSummary: string;
  corePillars: {
    area: string;
    currentLimitation: string;
    newDirection: string;
    strategicWhy: string;
  }[];
  designPrinciples: string[];
  uxPrinciples: string[];
  implementationBlueprint: string;
}

export interface AiInstructionsV2 {
  cursorRulesMarkdown: string;
  claudePromptMarkdown: string;
  geminiCodingInstructions: string;
  exactCssTokens: {
    variable: string;
    current: string;
    suggested: string;
    purpose: string;
  }[];
  refactoringChecklist: string[];
}

export interface RevoDesignBriefV2 {
  productIntent: string;
  targetAudience: string;
  currentDesignDna: string;
  strengthsSummary: string[];
  coreBottlenecks: string[];
  visualDirection: string[];
  motionPrinciples: string[];
  responsiveRules: string[];
  actionPriorities: string[];
}

export interface DesignDriftSnapshotV2 {
  id: string;
  timestamp: string;
  url: string;
  siteName: string;
  scores: {
    clarity: number;
    craft: number;
    convertibility: number;
    performance: number;
  };
  dnaFingerprint: string;
  notableFindings: string[];
}

export interface BeforeAfterComparisonV2 {
  baseSite: {
    url: string;
    name: string;
    clarityScore: number;
    craftScore: number;
    dnaSummary: string;
  };
  comparisonSite: {
    url: string;
    name: string;
    clarityScore: number;
    craftScore: number;
    dnaSummary: string;
  };
  sharedDna: string[];
  distinctDna: {
    baseDistinct: string[];
    comparisonDistinct: string[];
  };
  fusionOpportunities: string[];
  dnaConflicts: string[];
  strengthsComparison: {
    baseAdvantage: string[];
    comparisonAdvantage: string[];
  };
  strategicVerdict: string;
}

export interface StructuredAnalysisResponse {
  id: string;
  ownerId?: string;
  url: string;
  siteName: string;
  analyzedAt: string;
  siteType: string;
  primaryGoal: string;
  goalConfidence: number;
  whatRevoSees: WhatRevoSees;
  whyItWorks: WhyItWorksItem[];
  whereItBreaks: WhereItBreaksItem[];
  scores: RevoAnalysisScores;
  topOpportunities: PriorityOpportunity[];
  overallDiagnosis: string;
  evidence: WebsiteEvidencePackage;
  status: 'success' | 'partial' | 'error';
  errorMessage?: string;
  processingMetadata?: {
    timings?: AnalysisProcessingTimings;
    attempts?: number;
    failedStage?: string;
  };

  // V2 Reasoning & Intelligence Layers
  executiveSummary?: ExecutiveSummaryV2;
  designDna?: DesignDnaV2;
  familiarity?: FamiliarityAnalysisV2;
  showMeWhy?: ShowMeWhyItemV2[];
  rootCauses?: RootCauseNodeV2[];
  issueClusters?: IssueClusterV2[];
  quickWins?: QuickWinItemV2[];
  roadmapTiers?: {
    immediate: PriorityOpportunity[];
    highImpact: PriorityOpportunity[];
    structural: PriorityOpportunity[];
    experimental: PriorityOpportunity[];
  };
  varietyOptions?: VarietyOptionV2[];
  designNew?: DesignNewDirectionV2;
  aiInstructions?: AiInstructionsV2;
  designBrief?: RevoDesignBriefV2;
}

export interface AnalysisDocument {
  id?: string;
  _id?: string;
  ownerId?: string;
  url: string;
  normalizedUrl: string;
  status: AnalysisDbStatus;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  completedAt?: Date;
  site: {
    title: string;
    description: string;
    type: string;
    primaryGoal: string;
  };
  evidence: {
    playwright?: {
      viewport: { width: number; height: number };
      headingsCount: number;
      primaryCtas: string[];
      hasScreenshot: boolean;
      loadTimeMs: number;
    };
    pageSpeed?: {
      performance?: number;
      accessibility?: number;
      bestPractices?: number;
      seo?: number;
      fcp?: string;
      lcp?: string;
    };
    content?: {
      visibleTextLength: number;
      dominantColors: string[];
    };
    initialVsRendered?: InitialVsRenderedStats;
  };
  analysis?: {
    whatRevoSees: WhatRevoSees;
    whyItWorks: WhyItWorksItem[];
    whereItBreaks: WhereItBreaksItem[];
    scores: RevoAnalysisScores;
    opportunities: PriorityOpportunity[];
    overallDiagnosis: string;
    executiveSummary?: ExecutiveSummaryV2;
    designDna?: DesignDnaV2;
  };
  errors?: string[];
  metadata?: {
    timings?: AnalysisProcessingTimings;
    attempts?: number;
    clientIpHash?: string;
    failedStage?: string;
  };
}

export type MongoAnalysisDocument = AnalysisDocument;

