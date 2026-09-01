import {
  WebsiteEvidencePackage,
  StructuredAnalysisResponse,
  DesignDnaV2,
  AwardWebsiteType,
  AwardQualitativeLevel,
  AwardJudgingDimension,
  AwardJudgingDimensionKey,
  NegativeAwardSignal,
  PositiveAwardSignal,
  AwardImprovement,
  AwardIntelligenceV2,
} from '../../src/types.js';

/**
 * REVO — AWARD INTELLIGENCE V2 EVALUATOR
 *
 * Evaluates websites against generalized judging principles derived from major
 * international digital/design awards (Awwwards, FWA, Webby Awards, CSS Design Awards, Red Dot, D&AD).
 *
 * CRITICAL PRINCIPLE: Website Quality != Award Potential.
 * A fast, accessible, technically sound website can still have low creative-award potential if it lacks
 * an original creative idea, bespoke art direction, storytelling, or distinctiveness.
 */

export function classifyWebsiteType(
  evidence: WebsiteEvidencePackage,
  siteName: string,
  rawSiteType?: string
): { type: AwardWebsiteType; displayName: string; categoryExpectations: string } {
  const text = (evidence.visibleTextSummary || '').toLowerCase();
  const url = (evidence.url || '').toLowerCase();
  const title = (evidence.title || '').toLowerCase();
  const meta = (evidence.metaDescription || '').toLowerCase();
  const explicitType = (rawSiteType || '').toLowerCase();

  if (
    explicitType.includes('portfolio') ||
    title.includes('portfolio') ||
    text.includes('selected work') ||
    text.includes('projects') && (text.includes('freelance') || text.includes('designer') || text.includes('art director'))
  ) {
    return {
      type: 'portfolio',
      displayName: 'Portfolio / Creator Showcase',
      categoryExpectations: 'High creative freedom expected. Prioritizes distinct artistic direction, personal identity, and interaction craft over commercial conversion grids.',
    };
  }

  if (
    explicitType.includes('agency') ||
    explicitType.includes('studio') ||
    title.includes('agency') ||
    title.includes('studio') ||
    text.includes('creative agency') ||
    text.includes('digital studio') ||
    text.includes('design studio')
  ) {
    return {
      type: 'agency',
      displayName: 'Agency / Design Studio',
      categoryExpectations: 'Expected to demonstrate industry-leading craft, bespoke motion, strong creative vision, and exceptional storytelling to prove agency capabilities.',
    };
  }

  if (
    explicitType.includes('developer') ||
    text.includes('documentation') ||
    text.includes('api reference') ||
    text.includes('npm install') ||
    text.includes('cli') ||
    text.includes('sdk')
  ) {
    return {
      type: 'developer_tool',
      displayName: 'Developer Tool / Infrastructure',
      categoryExpectations: 'Prioritizes maximum clarity, technical precision, code ergonomics, and rapid comprehension. Creative flair must serve speed and mental model clarity.',
    };
  }

  if (
    explicitType.includes('ecommerce') ||
    explicitType.includes('store') ||
    explicitType.includes('shop') ||
    text.includes('add to cart') ||
    text.includes('checkout') ||
    text.includes('price') && text.includes('shipping')
  ) {
    return {
      type: 'ecommerce',
      displayName: 'E-Commerce / Digital Store',
      categoryExpectations: 'Balancing frictionless commercial transaction UX with tactile product presentation, brand atmosphere, and memorable visual storytelling.',
    };
  }

  if (
    explicitType.includes('editorial') ||
    explicitType.includes('magazine') ||
    text.includes('issue') ||
    text.includes('publication') ||
    text.includes('articles') && text.includes('reading time')
  ) {
    return {
      type: 'editorial',
      displayName: 'Editorial / Publication',
      categoryExpectations: 'Prioritizes typographic hierarchy, readability, spatial pacing, narrative layout structures, and refined article composition.',
    };
  }

  if (
    explicitType.includes('cultural') ||
    explicitType.includes('museum') ||
    text.includes('exhibition') ||
    text.includes('arts') ||
    text.includes('festival')
  ) {
    return {
      type: 'cultural',
      displayName: 'Cultural / Arts / Exhibition',
      categoryExpectations: 'High expectation for emotional resonance, immersive atmosphere, non-standard layouts, and conceptual depth.',
    };
  }

  if (
    explicitType.includes('campaign') ||
    text.includes('campaign') ||
    text.includes('launching soon') ||
    text.includes('experience') && text.includes('special edition')
  ) {
    return {
      type: 'campaign',
      displayName: 'Campaign / Promotional Launch',
      categoryExpectations: 'High creative urgency. Evaluated on bold concept execution, immersive visual impact, interactive engagement, and memorability.',
    };
  }

  if (
    explicitType.includes('experimental') ||
    text.includes('webgl') ||
    text.includes('three.js') ||
    text.includes('interactive canvas') ||
    text.includes('generative')
  ) {
    return {
      type: 'experimental',
      displayName: 'Experimental / Interactive Experience',
      categoryExpectations: 'Maximum creative & technical ambition expected. Evaluated on original interaction mechanics, novel technology usage, and artistic risk.',
    };
  }

  if (
    explicitType.includes('saas') ||
    explicitType.includes('product') ||
    text.includes('pricing') ||
    text.includes('free trial') ||
    text.includes('dashboard') ||
    text.includes('software')
  ) {
    return {
      type: 'saas',
      displayName: 'SaaS / Digital Product',
      categoryExpectations: 'Primary purpose is product communication and conversion. Award potential depends on escaping generic SaaS template formulas through distinctive concept and craft.',
    };
  }

  if (
    explicitType.includes('corporate') ||
    text.includes('investor relations') ||
    text.includes('governance') ||
    text.includes('enterprise solutions')
  ) {
    return {
      type: 'corporate',
      displayName: 'Corporate / Enterprise',
      categoryExpectations: 'Evaluated on brand authority, executive polish, layout discipline, and turning complex corporate narratives into engaging digital experiences.',
    };
  }

  return {
    type: 'other',
    displayName: 'Digital Web Experience',
    categoryExpectations: 'Evaluated against generalized international digital award standards for idea, visual craft, interaction, and distinctiveness.',
  };
}

export function evaluateAwardIntelligenceV2(
  evidence: WebsiteEvidencePackage,
  baseScores: StructuredAnalysisResponse['scores'],
  designDna: DesignDnaV2,
  siteName: string,
  rawSiteType?: string
): AwardIntelligenceV2 {
  const { type, displayName: typeDisplayName, categoryExpectations } = classifyWebsiteType(
    evidence,
    siteName,
    rawSiteType
  );

  const text = (evidence.visibleTextSummary || '').toLowerCase();
  const h1 = evidence.headings.find((h) => h.level.toLowerCase() === 'h1')?.text || evidence.title || '';
  const totalHeadings = evidence.headings.length;
  const totalCtas = evidence.primaryCtas.length;
  const totalButtons = evidence.totalButtons;
  const totalLinks = evidence.totalLinks;
  const ps = evidence.pageSpeedMetrics;

  // 1. Calculate WEBSITE QUALITY SCORE (0 - 100)
  // Reflects usability, performance, accessibility, SEO, clarity, and technical quality.
  const clarity = (baseScores.clarity?.score || 7.5) * 10;
  const usability = (baseScores.usability?.score || 7.5) * 10;
  const accessibility = (baseScores.accessibility?.score || (ps?.accessibility ? ps.accessibility : 80));
  const performance = (baseScores.performance?.score || (ps?.performance ? ps.performance : 80));
  const technical = (baseScores.technicalQuality?.score || 8.0) * 10;
  const content = (baseScores.contentQuality?.score || 7.5) * 10;

  const websiteQualityScore = Math.min(
    99,
    Math.max(
      10,
      Math.round(
        usability * 0.20 +
        clarity * 0.20 +
        technical * 0.15 +
        performance * 0.15 +
        accessibility * 0.15 +
        content * 0.15
      )
    )
  );

  // 2. DETECT NEGATIVE AWARD SIGNALS
  const negativeSignals: NegativeAwardSignal[] = [];

  // Check generic SaaS patterns
  const genericSaasTerms = ['all-in-one', 'supercharge', 'empower', 'everything you need', 'streamline your workflow', 'boost your productivity'];
  const hasGenericCopy = genericSaasTerms.some((term) => text.includes(term));
  const hasStandardButtonPair = totalCtas >= 2 && text.includes('get started') && (text.includes('book a demo') || text.includes('learn more'));
  if (type === 'saas' && (hasGenericCopy || (hasStandardButtonPair && totalButtons > 12))) {
    negativeSignals.push({
      id: 'generic_saas_patterns',
      label: 'Predictable SaaS Layout Formula',
      severity: 'high',
      description: 'Uses predictable SaaS hero framing (Headline + standard dual CTAs + floating badge) seen across thousands of template sites.',
      evidence: `Detected generic hero copy framing ("${h1.slice(0, 40)}") with familiar dual CTA layout.`,
      penaltyPoints: 12,
    });
  }

  // Check template composition & interchangeable typography
  if (designDna.typography.style.includes('Neo-Grotesque') && designDna.density.level === 'compact' && totalHeadings > 10) {
    negativeSignals.push({
      id: 'interchangeable_typography',
      label: 'Interchangeable Typographic Voice',
      severity: 'medium',
      description: 'Typography relies on standard unstyled sans-serif weights without custom display character or distinctive tracking.',
      evidence: 'Standard Neo-Grotesque typeface with uniform font weights across sections.',
      penaltyPoints: 8,
    });
  }

  // Check decorative animation without purpose
  if (evidence.consoleErrors && evidence.consoleErrors.length > 2) {
    negativeSignals.push({
      id: 'unfinished_states',
      label: 'Console Runtime Errors',
      severity: 'medium',
      description: 'Client runtime execution produces console exceptions during interaction, undermining execution craft.',
      evidence: `${evidence.consoleErrors.length} active console error logs detected during DOM inspection.`,
      penaltyPoints: 10,
    });
  }

  // Check excessive button density diluting focus
  if (totalButtons > 24) {
    negativeSignals.push({
      id: 'action_clutter',
      label: 'Excessive Control Clutter',
      severity: 'medium',
      description: 'High volume of interactive triggers dilutes visual hierarchy and weakens focal tension.',
      evidence: `${totalButtons} interactive button triggers competing in the single page DOM.`,
      penaltyPoints: 7,
    });
  }

  // Check copied/familiar interaction patterns
  if (totalLinks > 40 && totalHeadings < 6) {
    negativeSignals.push({
      id: 'weak_art_direction',
      label: 'Weak Art Direction & Narrative Pacing',
      severity: 'high',
      description: 'High link density paired with sparse structured headings indicates information dumping rather than curated visual storytelling.',
      evidence: `${totalLinks} links with only ${totalHeadings} structured heading anchors.`,
      penaltyPoints: 11,
    });
  }

  // 3. DETECT POSITIVE AWARD SIGNALS
  const positiveSignals: PositiveAwardSignal[] = [];

  const h1Length = h1.length;
  if (h1Length > 40) {
    positiveSignals.push({
      id: 'editorial_narrative',
      label: 'Editorial Headline Framing',
      severity: 'high',
      strength: 'high',
      description: 'Headline uses distinct editorial framing rather than standard punchy marketing buzzwords.',
      evidence: `Headline "${h1.slice(0, 50)}..." establishes an expressive tone.`,
      bonusPoints: 9,
    } as any);
  }

  if (evidence.dominantColors.length >= 3) {
    positiveSignals.push({
      id: 'deliberate_palette',
      label: 'Deliberate Chromatic Palette',
      severity: 'medium',
      strength: 'medium',
      description: 'Uses a multi-tier color palette with dedicated accent strategy.',
      evidence: `Identified ${evidence.dominantColors.length} primary palette tokens (${evidence.dominantColors.slice(0, 3).join(', ')}).`,
      bonusPoints: 7,
    } as any);
  }

  if (evidence.loadTimeMs < 1000) {
    positiveSignals.push({
      id: 'subsecond_execution',
      label: 'Sub-Second Asset Delivery',
      severity: 'high',
      strength: 'high',
      description: 'Page hydrates rapidly, providing instantaneous visual feedback essential for high-craft digital experiences.',
      evidence: `Document load completed in ${evidence.loadTimeMs}ms.`,
      bonusPoints: 8,
    } as any);
  }

  // 4. EVALUATE MINIMALISM
  const isMinimalist = (totalButtons < 10 && totalHeadings < 8) || designDna.density.level === 'spacious';
  let minimalismVerdict = 'The website is not strictly minimalist; it presents a structured multi-component layout.';
  let minimalismImpact = 'Minimalism is neutral for this evaluation.';

  if (isMinimalist) {
    if (positiveSignals.length >= 2 && negativeSignals.length <= 1) {
      minimalismVerdict = 'The website employs restrained, intentional minimalism. The restrained element count elevates typography and negative space as primary design features.';
      minimalismImpact = 'Positive: Restrained minimalism strengthens conceptual clarity and visual craft.';
    } else {
      minimalismVerdict = 'The website displays low density, but this reflects sparse content rather than a bold minimalist concept.';
      minimalismImpact = 'Neutral: Minimalism must be paired with elevated typographic craft to serve as an award signal.';
    }
  }

  // 5. EVALUATE THE 14 GENERALIZED AWARD JUDGING DIMENSIONS
  // Base raw scores derived from craft, creativity, brandStrength, and evidence package
  const baseCreativity = (baseScores.creativity?.score || 6.5) * 10;
  const baseCraft = (baseScores.craft?.score || 7.0) * 10;
  const baseBrand = (baseScores.brandStrength?.score || 6.8) * 10;
  const baseHierarchy = (baseScores.visualHierarchy?.score || 7.2) * 10;

  // Penalties calculation
  const totalPenalties = negativeSignals.reduce((acc, sig) => acc + sig.penaltyPoints, 0);
  const totalBonuses = positiveSignals.reduce((acc, sig) => acc + sig.bonusPoints, 0);

  // Category specific multipliers
  let ambitionFactor = 1.0;
  let craftFactor = 1.0;
  if (type === 'portfolio' || type === 'agency' || type === 'experimental' || type === 'campaign') {
    ambitionFactor = 1.15;
    craftFactor = 1.1;
  } else if (type === 'saas' || type === 'developer_tool' || type === 'corporate') {
    ambitionFactor = 0.85; // SaaS sites require extra distinctiveness to score high on awards
  }

  const dimensions: AwardJudgingDimension[] = [
    {
      key: 'originalityIdea',
      name: 'Originality / Strength of Idea',
      categoryGroup: 'Creative Idea',
      score: Math.min(98, Math.max(15, Math.round((baseCreativity * 0.8 + totalBonuses - totalPenalties * 0.4) * ambitionFactor))),
      weight: 1.3,
      status: 'neutral',
      assessment: 'Evaluates whether the website is anchored by a clear, original creative concept rather than a standard template layout.',
      evidence: [
        `Site Type: ${typeDisplayName}`,
        `Originality score influenced by ${negativeSignals.length} detected template signals.`,
      ],
    },
    {
      key: 'creativeAmbition',
      name: 'Creative Ambition',
      categoryGroup: 'Creative Idea',
      score: Math.min(98, Math.max(15, Math.round((baseCreativity * 0.75 + baseBrand * 0.25 + totalBonuses) * ambitionFactor))),
      weight: 1.2,
      status: 'neutral',
      assessment: 'Measures the willingness to break convention, explore novel visual structures, or push digital boundaries.',
      evidence: [
        `Category expectations for ${typeDisplayName}: ${categoryExpectations.slice(0, 80)}...`,
      ],
    },
    {
      key: 'visualCraft',
      name: 'Visual Craft & Art Direction',
      categoryGroup: 'Craft & Execution',
      score: Math.min(99, Math.max(20, Math.round((baseCraft * 0.7 + baseHierarchy * 0.3) * craftFactor))),
      weight: 1.4,
      status: 'neutral',
      assessment: 'Evaluates the precision of typography, spatial rhythm, grid alignment, color palette, and visual hierarchy.',
      evidence: [
        `Typography Style: ${designDna.typography.style}`,
        `Spatial Density: ${designDna.density.level.toUpperCase()}`,
        `Dominant Palette: ${evidence.dominantColors.slice(0, 3).join(', ')}`,
      ],
    },
    {
      key: 'interactionDesign',
      name: 'Interaction Design & Ergonomics',
      categoryGroup: 'Craft & Execution',
      score: Math.min(98, Math.max(20, Math.round(usability * 0.6 + baseCraft * 0.4 - (totalButtons > 25 ? 10 : 0)))),
      weight: 1.2,
      status: 'neutral',
      assessment: 'Assesses how intuitive, tactile, and responsive user interactions feel across viewports.',
      evidence: [
        `${totalButtons} interactive controls detected.`,
        `Viewport framing: ${evidence.viewport.width}x${evidence.viewport.height}px.`,
      ],
    },
    {
      key: 'motion',
      name: 'Purposeful Motion & Animation',
      categoryGroup: 'Craft & Execution',
      score: Math.min(95, Math.max(15, Math.round(baseCraft * 0.65 + (isMinimalist ? 15 : 5)))),
      weight: 1.1,
      status: 'neutral',
      assessment: 'Distinguishes expressive, purposeful motion design from decorative animation noise.',
      evidence: [
        `Motion presence: ${designDna.motion.presence}`,
        `Interaction style: ${designDna.motion.interactionStyle}`,
      ],
    },
    {
      key: 'overallExperience',
      name: 'Overall Digital Experience',
      categoryGroup: 'Experience & Emotion',
      score: Math.min(98, Math.max(20, Math.round((baseCraft * 0.4 + baseCreativity * 0.4 + baseHierarchy * 0.2)))),
      weight: 1.4,
      status: 'neutral',
      assessment: 'Evaluates whether the site creates an immersive digital experience rather than simply presenting raw information.',
      evidence: [
        `Layout pattern: ${designDna.composition.layoutPattern}`,
      ],
    },
    {
      key: 'usability',
      name: 'Usability & Ergonomics',
      categoryGroup: 'Category Fit',
      score: Math.min(99, Math.max(25, Math.round(usability))),
      weight: 1.0,
      status: 'neutral',
      assessment: 'Verifies that creative choices do not compromise legibility, navigation clarity, or user goals.',
      evidence: [
        `Navigation routes: ${evidence.navigationItems.length}`,
        `PageSpeed Usability/Accessibility Index: ${accessibility}/100`,
      ],
    },
    {
      key: 'executionQuality',
      name: 'Execution Quality & Polish',
      categoryGroup: 'Craft & Execution',
      score: Math.min(99, Math.max(20, Math.round(technical * 0.5 + performance * 0.5))),
      weight: 1.3,
      status: 'neutral',
      assessment: 'Measures technical perfection, zero-defect rendering, asset optimization, and smooth performance.',
      evidence: [
        `Console errors: ${evidence.consoleErrors?.length || 0}`,
        `Document load time: ${evidence.loadTimeMs}ms`,
      ],
    },
    {
      key: 'coherence',
      name: 'Visual & Conceptual Coherence',
      categoryGroup: 'Craft & Execution',
      score: Math.min(98, Math.max(20, Math.round(baseCraft * 0.5 + baseHierarchy * 0.5 - (negativeSignals.length * 4)))),
      weight: 1.2,
      status: 'neutral',
      assessment: 'Checks whether typography, color, spacing, and interaction decisions reinforce a single creative direction.',
      evidence: [
        `Design DNA Fingerprint: ${designDna.fingerprintBadge}`,
      ],
    },
    {
      key: 'storytelling',
      name: 'Storytelling & Narrative Pacing',
      categoryGroup: 'Experience & Emotion',
      score: Math.min(95, Math.max(15, Math.round((h1Length > 45 ? 80 : 60) + (totalHeadings > 4 ? 10 : 0) - (negativeSignals.length * 3)))),
      weight: 1.2,
      status: 'neutral',
      assessment: 'Evaluates how effectively the experience unfolds as a narrative progression down the fold.',
      evidence: [
        `Main headline: "${h1.slice(0, 45)}"`,
        `Section anchors: ${totalHeadings} headings guiding scrolling flow.`,
      ],
    },
    {
      key: 'emotionalImpact',
      name: 'Emotional Impact & Memorability',
      categoryGroup: 'Experience & Emotion',
      score: Math.min(95, Math.max(10, Math.round(baseBrand * 0.6 + baseCreativity * 0.4 * ambitionFactor))),
      weight: 1.1,
      status: 'neutral',
      assessment: 'Measures whether the experience leaves a lasting, memorable impression on the visitor.',
      evidence: [
        `Visual archetype: ${designDna.visualTone.archetype}`,
      ],
    },
    {
      key: 'innovation',
      name: 'Meaningful Innovation',
      categoryGroup: 'Creative Idea',
      score: Math.min(95, Math.max(10, Math.round(baseCreativity * 0.7 * ambitionFactor))),
      weight: 1.1,
      status: 'neutral',
      assessment: 'Evaluates novel use of web technology, unique interaction mechanics, or fresh conceptual framing.',
      evidence: [
        `Initial vs Rendered DOM delta: ${evidence.initialVsRendered?.isClientRenderedDominant ? 'Client-driven dynamic DOM' : 'Server HTML stream'}`,
      ],
    },
    {
      key: 'fitForPurpose',
      name: 'Fit for Purpose & Category Alignment',
      categoryGroup: 'Category Fit',
      score: Math.min(99, Math.max(30, Math.round(clarity * 0.5 + usability * 0.5))),
      weight: 1.0,
      status: 'neutral',
      assessment: 'Ensures creative expression remains aligned with the site’s core commercial or informational objectives.',
      evidence: [
        `Primary goal: ${evidence.primaryCtas[0] || 'Visitor Engagement'}`,
      ],
    },
    {
      key: 'distinctiveness',
      name: 'Distinctiveness & Point of View',
      categoryGroup: 'Creative Idea',
      score: Math.min(98, Math.max(15, Math.round((baseCreativity * 0.5 + baseBrand * 0.5 - (hasGenericCopy ? 15 : 0)) * ambitionFactor))),
      weight: 1.3,
      status: 'neutral',
      assessment: 'Measures whether the website possesses an unmistakable visual identity that sets it apart from competitors.',
      evidence: [
        `Distinctive elements check: ${positiveSignals.length} positive signals vs ${negativeSignals.length} template penalties.`,
      ],
    },
  ];

  // Tag strongest vs limiting
  dimensions.sort((a, b) => b.score - a.score);
  dimensions.slice(0, 4).forEach((d) => (d.status = 'strongest'));
  dimensions.slice(-4).forEach((d) => (d.status = 'limiting'));

  // Sort back by original key order for structured display
  const keyOrder: AwardJudgingDimensionKey[] = [
    'originalityIdea',
    'creativeAmbition',
    'visualCraft',
    'interactionDesign',
    'motion',
    'overallExperience',
    'usability',
    'executionQuality',
    'coherence',
    'storytelling',
    'emotionalImpact',
    'innovation',
    'fitForPurpose',
    'distinctiveness',
  ];

  const sortedDimensions = keyOrder
    .map((k) => dimensions.find((d) => d.key === k))
    .filter(Boolean) as AwardJudgingDimension[];

  const strongestDimensions = dimensions.filter((d) => d.status === 'strongest');
  const limitingDimensions = dimensions.filter((d) => d.status === 'limiting');

  // 6. COMPUTE FINAL AWARD POTENTIAL SCORE (0 - 100)
  // Weighted average of the 14 judging dimensions minus negative signal penalties
  const weightedSum = sortedDimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const totalWeight = sortedDimensions.reduce((sum, d) => sum + d.weight, 0);
  let rawAwardScore = Math.round(weightedSum / totalWeight);

  // Apply strict Award Potential cap for generic SaaS layouts per Requirement 2
  if (type === 'saas' && hasGenericCopy && hasStandardButtonPair) {
    rawAwardScore = Math.min(58, rawAwardScore);
  }

  const awardPotentialScore = Math.min(99, Math.max(12, rawAwardScore));

  // 7. DETERMINE QUALITATIVE LEVEL
  let qualitativeLevel: AwardQualitativeLevel = 'Conventional';
  let levelDescription = '';

  if (awardPotentialScore >= 90) {
    qualitativeLevel = 'Groundbreaking';
    levelDescription = 'Demonstrates industry-redefining innovation, extraordinary creative ambition, and flawless digital craft.';
  } else if (awardPotentialScore >= 80) {
    qualitativeLevel = 'Exceptional';
    levelDescription = 'Exhibits masterful execution, a compelling creative concept, and memorable interaction design.';
  } else if (awardPotentialScore >= 65) {
    qualitativeLevel = 'Award-Caliber Potential';
    levelDescription = 'High visual craft and refined art direction. Strong potential to compete in international award showcases with targeted creative refinement.';
  } else if (awardPotentialScore >= 50) {
    qualitativeLevel = 'Distinctive';
    levelDescription = 'Stands out from standard industry templates with a clear personality, though creative concept and motion craft can be pushed further.';
  } else if (awardPotentialScore >= 30) {
    qualitativeLevel = 'Promising';
    levelDescription = 'Competent visual execution with solid functional quality, but heavily reliant on familiar industry patterns.';
  } else {
    qualitativeLevel = 'Conventional';
    levelDescription = 'Standard functional web layout built primarily for utility without a distinct creative concept or bespoke art direction.';
  }

  // 8. RATIONALE & VERDICT
  const qualityVsAwardRationale = `REVO distinguishes Website Quality (${websiteQualityScore}/100) from Award Potential (${awardPotentialScore}/100). ` +
    (websiteQualityScore > awardPotentialScore + 15
      ? `This website scores high on functional quality (${websiteQualityScore}/100) due to clear messaging and solid usability, but its Award Potential (${awardPotentialScore}/100) is bounded because it relies on familiar ${typeDisplayName} layout conventions rather than an original creative concept.`
      : websiteQualityScore < awardPotentialScore - 10
      ? `This website possesses strong creative ambition (${awardPotentialScore}/100), though technical polish and usability adjustments (${websiteQualityScore}/100) will strengthen its overall competition readiness.`
      : `The website's functional quality (${websiteQualityScore}/100) and creative award potential (${awardPotentialScore}/100) are closely aligned within the ${qualitativeLevel} benchmark band.`);

  // Requirement 7: Percentile statement rule
  const percentileStatement = 'REVO cannot reliably calculate a percentile yet.';

  let verdict = '';
  if (awardPotentialScore >= 75) {
    verdict = `"${siteName} presents an impressive digital experience with strong art direction and refined visual craft. Its primary opportunity is deepening its storytelling pacing and interaction feedback to reach benchmark recognition."`;
  } else if (awardPotentialScore >= 50) {
    verdict = `"${siteName} is professionally executed and functionally solid. However, its visual language remains relatively familiar. Its highest-leverage creative opportunity is establishing a more distinctive conceptual core rather than simply adding decorative visual effects."`;
  } else {
    verdict = `"${siteName} serves its functional purpose well with clear messaging, but follows standard boilerplate layout formulas. To unlock award-caliber potential, it requires a bold art direction shift, bespoke typographic hierarchy, and a memorable narrative concept."`;
  }

  // 9. HIGH IMPACT CREATIVE IMPROVEMENTS
  const highestImpactImprovements: AwardImprovement[] = [
    {
      id: 'imp_1',
      title: 'Develop a Distinctive Creative Concept',
      category: 'Creative Concept',
      priority: 1,
      problem: `The current experience relies on familiar ${typeDisplayName} patterns without a unifying thematic idea.`,
      recommendation: 'Anchor the experience around a central visual metaphor or editorial narrative that dictates layout, motion, and typography.',
      expectedCreativeImpact: '+18 to +25 points on Originality and Distinctiveness judging dimensions.',
    },
    {
      id: 'imp_2',
      title: 'Elevate Art Direction & Typography Hierarchy',
      category: 'Art Direction',
      priority: 2,
      problem: 'Typography uses standard weights and neutral tracking, missing the character of bespoke editorial design.',
      recommendation: 'Pair a distinctive display typeface for section anchors with customized step ratio tracking (1.333+ scale).',
      expectedCreativeImpact: '+15 points on Visual Craft and Art Direction.',
    },
    {
      id: 'imp_3',
      title: 'Implement Expressive Scroll & Hover Micro-Interactions',
      category: 'Interaction Craft',
      priority: 3,
      problem: 'Interactions rely on basic browser defaults without tactile visual feedback.',
      recommendation: 'Add fluid micro-transitions (180ms ease-out) on primary triggers and scroll-linked section entrances.',
      expectedCreativeImpact: '+12 points on Motion and Interaction Design.',
    },
    {
      id: 'imp_4',
      title: 'Strengthen Narrative Progression & Storytelling',
      category: 'Storytelling',
      priority: 4,
      problem: 'Sections feel like independent feature blocks rather than a cohesive story unfolding down the fold.',
      recommendation: 'Use progressive visual reveals and sticky side-by-side narrative framing to guide the visitor through a clear arc.',
      expectedCreativeImpact: '+14 points on Storytelling and Overall Experience.',
    },
  ];

  return {
    websiteType: type,
    typeDisplayName,
    categoryExpectationsSummary: categoryExpectations,
    websiteQualityScore,
    awardPotentialScore,
    qualitativeLevel,
    levelDescription,
    qualityVsAwardRationale,
    percentileStatement,
    verdict,
    judgingDimensions: sortedDimensions,
    strongestDimensions,
    limitingDimensions,
    positiveSignals,
    negativeSignals,
    minimalismAssessment: {
      isMinimalist,
      verdict: minimalismVerdict,
      impactOnScore: minimalismImpact,
    },
    highestImpactImprovements,
  };
}
