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
}

export interface WhereItBreaksItem {
  title: string;
  explanation: string;
  evidence: string[];
  observedFriction?: string;
  inferredRisk?: string;
}

export interface PriorityOpportunity {
  priority: number;
  problem: string;
  whyItMatters: string;
  recommendation: string;
  expectedEffect: string;
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
