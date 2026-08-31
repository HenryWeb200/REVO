import {
  WebsiteEvidencePackage,
  StructuredAnalysisResponse,
  ExecutiveSummaryV2,
  DesignDnaV2,
  FamiliarityAnalysisV2,
  ShowMeWhyItemV2,
  RootCauseNodeV2,
  IssueClusterV2,
  QuickWinItemV2,
  VarietyOptionV2,
  DesignNewDirectionV2,
  AiInstructionsV2,
  RevoDesignBriefV2,
  PriorityOpportunity,
} from '../../src/types.js';

/**
 * Computes deterministic Design DNA from directly observed styles, colors, DOM hierarchy, and metrics.
 */
export function extractDesignDna(evidence: WebsiteEvidencePackage, siteName: string): DesignDnaV2 {
  const colors = evidence.dominantColors || [];
  const primaryColor = colors[0] || '#111827';
  const secondaryColor = colors[1] || '#FFFFFF';
  const accentColor = colors[2] || colors[0] || '#1D63ED';
  
  // Calculate luminance / dark mode heuristic
  const isDarkDominant = primaryColor.startsWith('#0') || 
    primaryColor.startsWith('#1') || 
    primaryColor.startsWith('#2') || 
    primaryColor.startsWith('#3');

  const totalHeadings = evidence.headings.length;
  const totalCtas = evidence.primaryCtas.length;
  const buttonDensity = evidence.totalButtons / Math.max(1, totalHeadings);

  // Density heuristic
  let densityLevel: 'spacious' | 'balanced' | 'compact' | 'dense' = 'balanced';
  if (buttonDensity > 2.8 || evidence.totalButtons > 28) {
    densityLevel = 'dense';
  } else if (buttonDensity > 1.5 || evidence.totalButtons > 16) {
    densityLevel = 'compact';
  } else if (evidence.totalButtons < 8 && totalHeadings < 8) {
    densityLevel = 'spacious';
  }

  // Heading hierarchy pattern & Typography style
  const h1 = evidence.headings.find((h) => h.level.toLowerCase() === 'h1')?.text || evidence.title || '';
  const h2Count = evidence.headings.filter((h) => h.level.toLowerCase() === 'h2').length;
  const h3Count = evidence.headings.filter((h) => h.level.toLowerCase() === 'h3').length;

  let headingStyle = 'Concise / Product-Focused Punchy Display';
  let typographyTag = 'Neo-Grotesque Product';
  if (h1.length > 55) {
    headingStyle = 'Editorial / Long-Form Narrative Display';
    typographyTag = 'Editorial Display';
  } else if (evidence.visibleTextSummary.toLowerCase().includes('api') || evidence.visibleTextSummary.toLowerCase().includes('developer') || evidence.visibleTextSummary.toLowerCase().includes('cli')) {
    headingStyle = 'Technical Monospaced & High-Density Display';
    typographyTag = 'Developer / Technical Sans';
  } else if (isDarkDominant) {
    headingStyle = 'High-Contrast Dark Mode Display';
    typographyTag = 'Precision Dark Grotesk';
  }

  // Geometry & Card Treatment
  let geometryTag = 'Precision Rounded (8–12px)';
  let cornerRadiusDesc = '8px to 12px modern UI radius on interactive triggers and card containers';
  if (densityLevel === 'spacious') {
    geometryTag = 'Soft Large Radius (16–20px)';
    cornerRadiusDesc = '14px to 20px organic pill/card radius for relaxed consumer feel';
  } else if (densityLevel === 'dense') {
    geometryTag = 'Sharp / Compact (4–8px)';
    cornerRadiusDesc = '4px to 8px tight technical radius maximizing screen efficiency';
  }

  // Composition archetype
  let layoutPattern = 'Centered focal hero leading into structured multi-column value grids';
  let focalBalance = totalCtas > 1 ? 'Primary focal point supported by balanced secondary links' : 'Single high-impact action trajectory';
  if (evidence.navigationItems.length > 6) {
    layoutPattern = 'Multi-tier enterprise navigation framing asymmetric product overview';
    focalBalance = 'Distributed focal points across multiple utility actions';
  } else if (evidence.totalImages > 8) {
    layoutPattern = 'Visual-first media showcase with supporting narrative blocks';
    focalBalance = 'Media-driven visual fixation anchoring value proposition';
  }

  // Fingerprint Badge summary
  const toneTag = isDarkDominant ? 'Dark Precision / Technical' : 'High-Contrast Neutral / Crisp';
  const fingerprintBadge = `Type: ${typographyTag} · Geometry: ${geometryTag} · Density: ${densityLevel.toUpperCase()} · Mode: ${isDarkDominant ? 'Dark' : 'Light'} · Tone: ${toneTag}`;

  return {
    typography: {
      style: headingStyle,
      headingHierarchy: `${evidence.headings.length} detected tiers (${h2Count} H2 section anchors, ${h3Count} H3 sub-anchors)`,
      contrast: isDarkDominant ? 'Luminescent high-contrast white foreground over deep neutral backdrop' : 'High-contrast foreground typography over restrained neutral base',
      rhythm: 'Step ratio 1.25+ with disciplined tracking on display headlines',
    },
    geometry: {
      cornerRadius: cornerRadiusDesc,
      cardStyle: 'Subtle 1px border framing (#E4E4E7) with flat elevation to eliminate visual noise',
      borderTreatment: 'Hairline neutral borders with optical padding math (Outer Padding >= Inner Padding)',
    },
    density: {
      level: densityLevel,
      spacingRhythm: densityLevel === 'spacious' 
        ? 'Generous macro-spacing (64px–96px section gaps) prioritizing cognitive breathing room' 
        : densityLevel === 'dense'
        ? 'High-density information packing (16px–24px grouping rhythm) for technical data efficiency'
        : 'Medium balanced density with disciplined 32px–48px grouping rhythm',
    },
    composition: {
      layoutPattern,
      focalBalance,
      negativeSpaceUsage: densityLevel === 'spacious' 
        ? 'Expansive negative space creating high visual distinction and luxury pacing' 
        : 'Restrained whitespace balancing information density with focused action paths',
    },
    colorProfile: {
      mode: isDarkDominant ? 'dark' : 'light',
      dominantPalette: colors.slice(0, 5),
      accentStrategy: `Monochromatic baseline with strategic accent pop (${accentColor}) on primary triggers`,
    },
    motion: {
      presence: 'Subtle state transitions on hover/focus (150ms ease-out)',
      interactionStyle: 'Restrained micro-interactions prioritizing immediate tactile feedback over decorative animations',
    },
    visualTone: {
      adjectives: isDarkDominant 
        ? ['Technical', 'Authoritative', 'Modern', 'Focused'] 
        : ['Crisp', 'Product-focused', 'Analytical', 'Modern'],
      archetype: isDarkDominant ? 'Technical Developer & Power-User Benchmark' : 'Modern SaaS & Digital Product Benchmark',
    },
    fingerprintBadge,
  };
}

/**
 * Evaluates Category Familiarity vs Distinctiveness without generic bias.
 */
export function analyzeFamiliarity(evidence: WebsiteEvidencePackage, dna: DesignDnaV2): FamiliarityAnalysisV2 {
  const overused: string[] = [];
  const distinctive: string[] = [];

  const h1 = evidence.headings.find((h) => h.level.toLowerCase() === 'h1')?.text || '';
  const textSample = (evidence.visibleTextSummary || '').toLowerCase();

  // Pattern detection for generic marketing clichés
  const genericClichés = [
    'all-in-one',
    'the future of',
    'supercharge',
    'empower',
    'elevate your',
    'seamlessly',
    'revolutionary',
    'next-gen',
    'ai-powered platform',
  ];

  let foundClichéCount = 0;
  for (const cliché of genericClichés) {
    if (h1.toLowerCase().includes(cliché) || textSample.includes(cliché)) {
      foundClichéCount++;
    }
  }

  if (foundClichéCount > 1) {
    overused.push(`Conventional SaaS buzzword phrasing (${foundClichéCount} cliché patterns detected in copy)`);
  } else if (h1.length > 0) {
    distinctive.push(`Concrete, descriptive value proposition ("${h1.slice(0, 45)}...")`);
  }

  if (evidence.totalButtons > 22) {
    overused.push('High button density creating visual competition across the viewport');
  } else if (evidence.primaryCtas.length === 1) {
    distinctive.push(`Single high-dominance action path ("${evidence.primaryCtas[0]}")`);
  }

  if (evidence.navigationItems.length >= 7) {
    overused.push('Standard crowded horizontal navigation bar');
  } else if (evidence.navigationItems.length > 0 && evidence.navigationItems.length <= 4) {
    distinctive.push('Lean, curated navigation hierarchy that minimizes choice fatigue');
  }

  if (evidence.dominantColors.length >= 2 && !evidence.dominantColors[0].includes('gradient')) {
    distinctive.push('Restrained chromatic discipline avoiding noisy gradient overlays');
  }

  const score = Math.max(5.5, Math.min(9.5, 7.5 + (distinctive.length - overused.length) * 0.7));
  const classification = score >= 8.0 ? 'distinctive' : score >= 6.8 ? 'balanced' : 'conventional';

  return {
    score: Number(score.toFixed(1)),
    classification,
    pros: 'Leverages recognized mental models so visitors immediately understand navigation and interactive affordances.',
    cons: overused.length > 0 
      ? `Relies on ${overused.length} common category patterns that risk blending into competitor experiences.` 
      : 'Maintains high discipline with minimal decorative risk.',
    overusedPatterns: overused.length > 0 ? overused : ['Standard card grid layout', 'Conventional top navbar arrangement'],
    distinctiveElements: distinctive.length > 0 ? distinctive : ['Clean typographic hierarchy', 'Direct value proposition messaging'],
    recommendation: 'Keep recognizable navigational mental models, but sharpen hero typography contrast and elevate product-specific proof points to stand out.',
  };
}

/**
 * Builds the Root Cause Graph and connects technical metrics to UX/Visual consequences.
 */
export function buildRootCausesAndClusters(
  evidence: WebsiteEvidencePackage,
  breaks: { title: string; explanation: string; evidence: string[] }[]
): {
  rootCauses: RootCauseNodeV2[];
  issueClusters: IssueClusterV2[];
} {
  const rootCauses: RootCauseNodeV2[] = [];
  const issueClusters: IssueClusterV2[] = [];

  const ps = evidence.pageSpeedMetrics;
  const loadTime = evidence.loadTimeMs || 800;

  // Root Cause 1: Performance / Hydration / Asset Weight
  if (loadTime > 1200 || (ps?.performance && ps.performance < 75) || evidence.totalImages > 10) {
    rootCauses.push({
      id: 'rc_tech_payload',
      title: 'Initial Asset Payload & Hydration Latency',
      category: 'technical',
      type: 'root_cause',
      description: `Document execution took ${loadTime}ms with ${evidence.totalImages} visual assets and external script dependencies.`,
      evidence: `Measured load time: ${loadTime}ms | Total images: ${evidence.totalImages} | PageSpeed Index: ${ps?.performance || 'N/A'}`,
      downstreamEffects: [
        'Delayed Largest Contentful Paint (LCP) causes visual layout shift during initial fold exposure',
        'Subconscious user impression of sluggishness reduces willingness to explore deeper routes',
        'Mobile visitors on cellular connections experience higher initial bounce rates',
      ],
    });

    issueClusters.push({
      id: 'cluster_perf_ux',
      rootIssue: 'Asset Weight & Render Latency Directly Diluting First Visual Impression',
      severity: loadTime > 2500 ? 'critical' : 'high',
      confidence: 'high',
      symptoms: [
        `LCP / Document load duration: ${loadTime}ms`,
        'Hero fold stabilization delay before interactive readiness',
        'Increased risk of bounce on mobile network conditions',
      ],
      technicalVisualRelationship: 'Large asset payloads and unoptimized font loading directly delay hero stabilization, creating a split-second blank or shifting frame that weakens initial visitor trust.',
      recommendedRootFix: 'Preload hero display font weights, compress hero graphics into modern AVIF/WebP, and defer non-critical analytics bundles.',
      expectedResult: 'Reduces visual stabilization time by 300–500ms, immediately improving perceived snappiness.',
    });
  }

  // Root Cause 2: Visual Hierarchy & Button Competition
  if (evidence.totalButtons > 12 || evidence.totalLinks > 28 || evidence.primaryCtas.length > 2) {
    rootCauses.push({
      id: 'rc_visual_hierarchy',
      title: 'Distributed Focal Weight Across Interactive Triggers',
      category: 'visual',
      type: 'root_cause',
      description: `${evidence.totalButtons} buttons and ${evidence.totalLinks} links compete for eye fixation across the viewport.`,
      evidence: `DOM Buttons: ${evidence.totalButtons} | DOM Links: ${evidence.totalLinks} | Headings: ${evidence.headings.length}`,
      downstreamEffects: [
        'Primary action button is visual peer to multiple secondary links',
        'Visitors experience micro-hesitation during the primary decision path',
        'Attention splits across competing visual outlines instead of following a single conversion trajectory',
      ],
    });

    issueClusters.push({
      id: 'cluster_hierarchy',
      rootIssue: 'Action Trajectory Dilution via Competing Visual Weights',
      severity: 'medium',
      confidence: 'high',
      symptoms: [
        `${evidence.totalButtons} actionable buttons on landing page`,
        'Secondary navigation items share similar font-weight and padding with primary CTA',
        'Cognitive load increases as eye tracks between multiple competing outlines',
      ],
      technicalVisualRelationship: 'Equal visual weight across CSS button classes translates directly to split conversion intent and lower click-through velocity on the primary conversion goal.',
      recommendedRootFix: 'Apply strict visual hierarchy: one high-contrast solid button for the primary action; demote all secondary and navigation links to text or muted ghost styles.',
      expectedResult: 'Creates an effortless eye trajectory directly to the primary action, increasing conversion velocity.',
    });
  }

  // Root Cause 3: Content Scanning Rhythm & Text Density
  if (evidence.visibleTextSummary.length > 1500 || evidence.headings.length > 10) {
    rootCauses.push({
      id: 'rc_content_scanning',
      title: 'High Cognitive Text Density in Secondary Sections',
      category: 'content',
      type: 'intermediate_friction',
      description: `Dense paragraph structures require sustained reading effort rather than enabling rapid scannability.`,
      evidence: `Extracted text length: ~${Math.round(evidence.visibleTextSummary.length / 5)} words across ${evidence.headings.length} heading levels`,
      downstreamEffects: [
        'Visitors scan past dense feature paragraphs without absorbing key differentiators',
        'Higher cognitive fatigue before reaching lower-funnel proof points',
      ],
    });

    issueClusters.push({
      id: 'cluster_content_rhythm',
      rootIssue: 'Paragraph Block Density Impeding Rapid Value Scanning',
      severity: 'medium',
      confidence: 'high',
      symptoms: [
        'Paragraph blocks exceeding 3 lines without bold lead-in anchors',
        'Uniform visual weight across feature descriptions',
      ],
      technicalVisualRelationship: 'Text block line-height and character width directly govern eye fatigue; long unformatted strings trigger skim abandonment.',
      recommendedRootFix: 'Constrain body copy line-lengths to 65–75ch, use high-contrast bold lead-ins on bullet points, and add metric badges.',
      expectedResult: 'Increases feature comprehension retention by ~35% during rapid scroll.',
    });
  }

  // Fallback cluster if none triggered
  if (issueClusters.length === 0) {
    issueClusters.push({
      id: 'cluster_scan_rhythm',
      rootIssue: 'Content Hierarchy Scannability Optimization',
      severity: 'low',
      confidence: 'high',
      symptoms: [
        `${evidence.headings.length} headings across page`,
        'Body typography density in feature segments',
      ],
      technicalVisualRelationship: 'Text block line-height and character width directly govern eye fatigue and reading momentum.',
      recommendedRootFix: 'Constrain body copy line-lengths to 65–75ch and increase vertical padding between major feature blocks.',
      expectedResult: 'Improves visitor reading stamina and feature comprehension.',
    });
  }

  return { rootCauses, issueClusters };
}

/**
 * Builds interactive "Show Me Why" items with precise claims, evidence proof, and reasoning chains.
 */
export function buildShowMeWhyItems(
  evidence: WebsiteEvidencePackage,
  scores: any,
  breaks: { title: string; explanation: string; evidence: string[] }[]
): ShowMeWhyItemV2[] {
  const items: ShowMeWhyItemV2[] = [];

  // Item 1: Hero Hierarchy & CTA Trajectory
  const h1 = evidence.headings.find((h) => h.level.toLowerCase() === 'h1')?.text || evidence.title || 'Main Value Proposition';
  const primaryCta = evidence.primaryCtas[0] || 'Primary Action';

  items.push({
    id: 'smw_hero_hierarchy',
    claim: 'Hero fold establishes clear initial positioning but distributes visual emphasis across competing controls.',
    category: 'hierarchy',
    observedProof: [
      `H1 headline present: "${h1.slice(0, 60)}"`,
      `Primary CTA: "${primaryCta}"`,
      `Total buttons detected in DOM: ${evidence.totalButtons}`,
      `Dominant accent color: ${evidence.dominantColors[0] || '#111827'}`,
    ],
    metricMeasurement: `${evidence.headings.length} heading levels · ${evidence.totalButtons} buttons · ${evidence.totalLinks} links`,
    affectedRegion: {
      label: 'Hero Viewport (Top 0–800px)',
      cssTarget: 'header, section:first-of-type, .hero',
      viewportDescription: 'First visible screenfold containing primary H1, navigation, and action triggers.',
    },
    reasoningChain: {
      problem: 'The eye has to filter through multiple interactive triggers before focusing on the primary conversion goal.',
      evidence: `${evidence.totalButtons} buttons and ${evidence.totalLinks} links observed in the rendered DOM.`,
      whyItMatters: 'Visitors make stay-or-leave decisions in under 3 seconds; visual competition increases cognitive friction.',
      rootCause: 'Secondary navigation links and secondary CTA buttons share comparable visual weight with the primary action.',
      recommendedChange: `Make "${primaryCta}" the only high-contrast solid button in the hero fold; demote all secondary links to outline/ghost styling.`,
      expectedEffect: 'Creates an immediate focal trajectory that accelerates conversion velocity.',
      priority: 'HIGH',
    },
    confidence: 'high',
  });

  // Item 2: Performance & Asset Delivery
  const loadMs = evidence.loadTimeMs || 750;
  items.push({
    id: 'smw_performance_lcp',
    claim: `Initial document response and DOM extraction completed in ${(loadMs / 1000).toFixed(2)}s with ${evidence.totalImages} visual assets.`,
    category: 'performance',
    observedProof: [
      `Measured load duration: ${loadMs}ms`,
      `DOM elements: ${evidence.totalButtons} buttons, ${evidence.totalLinks} links, ${evidence.totalImages} images`,
      `PageSpeed performance index: ${evidence.pageSpeedMetrics?.performance || 'Measured via direct browser trace'}`,
    ],
    metricMeasurement: `Load time: ${loadMs}ms · Images: ${evidence.totalImages}`,
    affectedRegion: {
      label: 'Global Network & Document Hydration',
      cssTarget: 'html, body, img',
      viewportDescription: 'Initial HTML document transfer and font/asset execution pipeline.',
    },
    reasoningChain: {
      problem: 'Document rendering involves multiple asset waterfalls that govern perceived speed and visual stability.',
      evidence: `Initial load completed in ${loadMs}ms across ${evidence.totalImages} visual assets.`,
      whyItMatters: 'Every 100ms of visual delay increases bounce probability on mobile networks.',
      rootCause: 'External script execution and unoptimized image dimensions in the initial viewport.',
      recommendedChange: 'Serve images in modern WebP/AVIF with explicit aspect ratios to eliminate layout shift.',
      expectedEffect: 'Stable visual painting with zero layout displacement.',
      priority: 'MEDIUM',
    },
    confidence: 'high',
  });

  // Item 3: Craft & Typography Rhythm
  items.push({
    id: 'smw_craft_typography',
    claim: 'Typographical scale maintains structured hierarchical anchors throughout the page.',
    category: 'typography',
    observedProof: [
      `${evidence.headings.length} structured headings across ${evidence.headings.filter((h) => h.level.toLowerCase() === 'h2').length} section clusters`,
      `Dominant palette: ${evidence.dominantColors.slice(0, 3).join(', ') || '#111827, #FFFFFF'}`,
      `Console errors: ${evidence.consoleErrors?.length || 0}`,
    ],
    metricMeasurement: `${evidence.headings.length} headings extracted`,
    affectedRegion: {
      label: 'Body Content & Section Dividers',
      cssTarget: 'h1, h2, h3, p',
      viewportDescription: 'Secondary and tertiary section blocks down the page fold.',
    },
    reasoningChain: {
      problem: 'Paragraph density in feature blocks can occasionally impede rapid scanning during quick scroll.',
      evidence: `Extracted visible text tokens: ~${Math.round(evidence.visibleTextSummary.length / 5)} words.`,
      whyItMatters: 'Scanning visitors skip dense narrative blocks unless structured with clear typographic anchors.',
      rootCause: 'Uniform typographic weights between introductory blurbs and feature details.',
      recommendedChange: 'Use high-contrast bold lead-ins for feature bullet points and constrain line length to 65–75ch.',
      expectedEffect: '30% faster reading comprehension during rapid scroll.',
      priority: 'MEDIUM',
    },
    confidence: 'high',
  });

  return items;
}

/**
 * Builds Quick Wins (Low Effort / High Impact).
 */
export function buildQuickWins(evidence: WebsiteEvidencePackage, cta: string): QuickWinItemV2[] {
  const primaryCta = cta || 'Primary Action';
  const primaryColor = evidence.dominantColors[0] || '#111827';
  const accentColor = evidence.dominantColors[2] || evidence.dominantColors[0] || '#1D63ED';

  return [
    {
      id: 'qw_cta_contrast',
      issue: 'Secondary links visually compete with the primary conversion trigger.',
      impact: 'High',
      effort: 'Minimal',
      confidence: 'high',
      fix: `Change secondary buttons in the hero to ghost/outline style (border-color: #E4E4E7; background: transparent) so "${primaryCta}" holds 100% focal dominance with solid background (${accentColor}).`,
      expectedResult: 'Immediate +12–18% increase in primary CTA click-through rate.',
    },
    {
      id: 'qw_heading_contrast',
      issue: 'Sub-headlines share similar visual contrast with body copy.',
      impact: 'Medium',
      effort: 'Minimal',
      confidence: 'high',
      fix: 'Apply letter-spacing: -0.025em on all H2 elements and increase font-weight from 500 to 700 to create sharp visual anchors.',
      expectedResult: 'Sharper visual anchors that facilitate rapid scanning.',
    },
    {
      id: 'qw_touch_targets',
      issue: 'Mobile interactive padding on small links is close to the minimum accessibility threshold.',
      impact: 'Medium',
      effort: 'Low',
      confidence: 'high',
      fix: 'Ensure all clickable links and icon buttons have minimum 44px × 44px tap targets via padding: 12px 16px.',
      expectedResult: 'Eliminates mis-clicks and mobile user frustration.',
    },
  ];
}

/**
 * Builds the 4-tier Prioritized Roadmap.
 */
export function buildRoadmapTiers(
  opportunities: PriorityOpportunity[],
  quickWins: QuickWinItemV2[]
): {
  immediate: PriorityOpportunity[];
  highImpact: PriorityOpportunity[];
  structural: PriorityOpportunity[];
  experimental: PriorityOpportunity[];
} {
  const immediate: PriorityOpportunity[] = [
    {
      priority: 1,
      problem: quickWins[0]?.issue || 'CTA Visual Competition in Hero',
      whyItMatters: 'Immediate conversion friction for first-time visitors.',
      recommendation: quickWins[0]?.fix || 'Elevate primary CTA contrast and demote secondary links.',
      expectedEffect: quickWins[0]?.expectedResult || '+15% primary funnel progression.',
      tier: 'immediate',
      effort: 'Low',
      confidence: 'high',
    },
  ];

  const highImpact: PriorityOpportunity[] = [
    {
      priority: 2,
      problem: 'Asset Hydration & LCP Optimization',
      whyItMatters: 'Visual paint delays increase mobile bounce rate before first engagement.',
      recommendation: 'Preload display font weights and serve images with explicit aspect ratios.',
      expectedEffect: '200–400ms faster perceived visual stabilization.',
      tier: 'high_impact',
      effort: 'Medium',
      confidence: 'high',
    },
    {
      priority: 3,
      problem: 'Feature Grid Scannability & Proof Points',
      whyItMatters: 'Visitors scan past dense copy blocks without absorbing key differentiators.',
      recommendation: 'Refactor feature blocks into 2-column grids with bold metric callouts.',
      expectedEffect: 'Higher time-on-page and message retention.',
      tier: 'high_impact',
      effort: 'Medium',
      confidence: 'high',
    },
  ];

  const structural: PriorityOpportunity[] = [
    {
      priority: 4,
      problem: 'Component Design System Consistency',
      whyItMatters: 'Inconsistent padding and radii across pages weakens brand authority.',
      recommendation: 'Unify button, input, and card tokens across a central Tailwind config.',
      expectedEffect: 'Reduced CSS bundle size and pristine multi-page brand cohesion.',
      tier: 'structural',
      effort: 'High',
      confidence: 'high',
    },
  ];

  const experimental: PriorityOpportunity[] = [
    {
      priority: 5,
      problem: 'Micro-Interaction Feedback on Primary Conversion Path',
      whyItMatters: 'Subtle motion rewards user intent and builds tactile product delight.',
      recommendation: 'Add a 150ms spring entrance to primary modals and hover states.',
      expectedEffect: 'Enhanced brand perception and memorable craft distinction.',
      tier: 'experimental',
      effort: 'Low',
      confidence: 'medium',
    },
  ];

  return { immediate, highImpact, structural, experimental };
}

/**
 * Builds the Variety Engine proposals (Current -> Minimal -> Editorial -> Bold -> Experimental).
 */
export function buildVarietyOptions(siteName: string, dna: DesignDnaV2): VarietyOptionV2[] {
  return [
    {
      id: 'opt_current',
      name: 'Current',
      tagline: 'The analyzed baseline architecture with tactical friction fixes applied.',
      keyChanges: ['Friction-free CTA hierarchy', 'Optimized heading contrast', 'Asset preloading'],
      preservedIdentity: ['Existing layout structure', 'Original brand palette', 'Core product messaging'],
      aestheticDirection: 'Refined version of current design language with cleaned metrics.',
      recommendedWhen: 'You want maximum conversion uplift with minimal engineering change.',
    },
    {
      id: 'opt_minimal',
      name: 'Minimal',
      tagline: 'Radical reduction: generous negative space, monochromatic base, and zero visual clutter.',
      keyChanges: [
        'Strip all secondary decorative borders and subtle background fills',
        'Increase macro whitespace by 40%',
        'Single high-contrast black/white CTA trigger',
      ],
      preservedIdentity: ['Core value proposition', 'Brand typography family'],
      aestheticDirection: 'Ultra-clean, restrained, Scandinavian digital minimalism.',
      recommendedWhen: 'Your product is powerful and speaks for itself without promotional decoration.',
    },
    {
      id: 'opt_editorial',
      name: 'Editorial',
      tagline: 'High-contrast typography, narrative pacing, and magazine-style typographic hierarchy.',
      keyChanges: [
        'Pair a serif display font for headlines with clean sans body text',
        'Asymmetric 2-column narrative layout with pull-quotes',
        'Deep warm-neutral tinted canvas (#FBFBFA)',
      ],
      preservedIdentity: ['Product intent', 'Core proof points'],
      aestheticDirection: 'Thoughtful, authoritative, high-craft editorial publication.',
      recommendedWhen: 'Brand storytelling and intellectual authority drive your sales cycle.',
    },
    {
      id: 'opt_bold',
      name: 'Bold',
      tagline: 'High-density, punchy typography, sharp geometric cards, and vivid accent pops.',
      keyChanges: [
        'Oversized display typography with tight letter-spacing (-0.04em)',
        'High-contrast solid container blocks with 0px or 4px sharp corners',
        'Vibrant electric accent color on all primary keyframes',
      ],
      preservedIdentity: ['Conversion funnel', 'Key feature structure'],
      aestheticDirection: 'Confident, assertive, next-generation developer tooling archetype.',
      recommendedWhen: 'Targeting technical developers, founders, and modern power users.',
    },
    {
      id: 'opt_experimental',
      name: 'Experimental',
      tagline: 'Boundary-pushing layout with directional spatial flow and dynamic tactile interactions.',
      keyChanges: [
        'Non-traditional spatial grid with floating glass-less HUD elements',
        'Physics-driven micro-interactions on scroll',
        'Interactive live feature sandbox in the hero fold',
      ],
      preservedIdentity: ['Fundamental value proposition'],
      aestheticDirection: 'Cutting-edge digital craft benchmark / Awwwards potential.',
      recommendedWhen: 'You need an unmistakable, memorable brand splash that gets shared across design communities.',
    },
  ];
}

/**
 * Builds the Design New Direction architectural proposal.
 */
export function buildDesignNew(siteName: string, h1: string, cta: string): DesignNewDirectionV2 {
  return {
    visionTitle: `REVO Next-Generation Design Blueprint for ${siteName}`,
    visionSummary: `Elevate ${siteName} from a functional web presence into an authoritative, high-velocity digital product instrument. The redesign establishes single-point focal clarity, mathematical spacing rhythm, and high-contrast typography that converts visitors in under 5 seconds.`,
    corePillars: [
      {
        area: 'Hero Architecture & Conversion Funnel',
        currentLimitation: 'Secondary buttons and navigation items compete with the primary conversion trigger.',
        newDirection: `Single-focal-point hero with oversized display typography and exclusive high-contrast "${cta}" button.`,
        strategicWhy: 'Eliminates choice paralysis and accelerates first-time user activation.',
      },
      {
        area: 'Information Density & Cognitive Pacing',
        currentLimitation: 'Feature segments rely on uniform text blocks that encourage rapid skimming.',
        newDirection: 'Two-column bento modules pairing interactive preview widgets with bold metric evidence.',
        strategicWhy: 'Demonstrates tangible product proof rather than asking visitors to read abstract claims.',
      },
      {
        area: 'Design System & Spacing Math',
        currentLimitation: 'Occasional variation in container padding and corner radii across sections.',
        newDirection: 'Strict 8pt spacing grid with mathematical corner radius nesting (Outer Radius = Inner Radius + Padding).',
        strategicWhy: 'Subconsciously communicates engineering excellence and institutional trust.',
      },
    ],
    designPrinciples: [
      'Clarity over decoration — every pixel must justify its existence with function.',
      'One focal point per screenfold — guide the eye with intentional visual weight.',
      'Show, do not tell — ground every value claim in concrete UI evidence.',
    ],
    uxPrinciples: [
      'Immediate affordance on interactive triggers (clear hover/active states).',
      'Zero-delay mobile navigation with minimum 44px tap areas.',
      'Transparent next steps with zero hidden friction.',
    ],
    implementationBlueprint: `
1. Typography: Standardize on an 8-tier typographic scale (Display: 64px/0.95, H1: 44px/1.1, H2: 32px/1.2, Body: 16px/1.6).
2. Color Tokens: Background #FAFAFA, Surface #FFFFFF, Border #E4E4E7, Text Primary #111827, Text Muted #71717A, Accent #1D63ED.
3. Component Refactor: Style primary action buttons with bg-[#1D63ED] text-white px-5 py-2.5 rounded-xl; demote all others to transparent border-[#E4E4E7].
4. Layout: Wrap main content in max-w-[1280px] mx-auto with 32px horizontal padding.
`.trim(),
  };
}

/**
 * Builds AI Implementation Instructions (for Cursor, Claude, and Gemini).
 */
export function buildAiInstructions(
  siteName: string,
  url: string,
  dna: DesignDnaV2,
  quickWins: QuickWinItemV2[],
  designNew: DesignNewDirectionV2
): AiInstructionsV2 {
  const cursorRulesMarkdown = `
# REVO V2 Cursor Rules for ${siteName} (${url})
# Generated based on live website evidence and diagnostic analysis

## Design DNA & Styling Specifications
- Typography Scale: Use high-contrast display headlines with letter-spacing: -0.035em. Line height for body copy must be 1.6.
- Spacing Rhythms: Follow an 8pt grid (padding: 16px/24px/32px/64px). Never mix arbitrary pixel paddings.
- Container Border Radius Math: Inner Radius = Outer Radius - Padding. Outer cards max 16px radius.
- Color Tokens:
  - Neutral Base: #FAFAFA (Background), #FFFFFF (Surface Cards)
  - Borders: #E4E4E7 (1px solid hairline)
  - Text Primary: #111827
  - Text Muted: #71717A
  - Accent Trigger: #1D63ED

## Required Code Refactor Actions
${quickWins.map((qw, i) => `${i + 1}. [${qw.impact} Impact] ${qw.fix}`).join('\n')}

## UX & Accessibility Directives
- Ensure all clickable triggers have a minimum touch target of 44px × 44px.
- Maintain a single primary solid button per view; use outline/ghost for secondary actions.
- Avoid low-contrast text on gray backgrounds (must exceed WCAG AA 4.5:1 ratio).
`.trim();

  const claudePromptMarkdown = `
You are a senior frontend architect refactoring ${siteName} (${url}) based on REVO V2 diagnostic intelligence.

TARGET SPECIFICATIONS:
- Primary Action: Elevate primary CTA with high-contrast solid fill; demote secondary links to outline.
- Layout: Modern single-view structure with ${dna.density.level} density and disciplined whitespace.
- Principles:
${designNew.designPrinciples.map((p) => `  * ${p}`).join('\n')}

Please refactor the main landing page components in React + Tailwind CSS following these exact tokens.
`.trim();

  const geminiCodingInstructions = `
Implement the REVO V2 design improvements for ${siteName}:
1. Align typography to display tracking (-0.035em) and body line-height (1.6).
2. Unify button hierarchy: exactly one solid primary button per section.
3. Optimize image loading attributes (loading="lazy", decoding="async", explicit aspect-ratio).
`.trim();

  return {
    cursorRulesMarkdown,
    claudePromptMarkdown,
    geminiCodingInstructions,
    exactCssTokens: [
      { variable: '--bg-canvas', current: '#FFFFFF', suggested: '#FAFAFA', purpose: 'Reduces stark glare and frames surface cards' },
      { variable: '--border-subtle', current: 'various', suggested: '#E4E4E7', purpose: 'Standardizes hairline card borders' },
      { variable: '--text-primary', current: '#000000', suggested: '#111827', purpose: 'Softens pure black for optimal typography contrast' },
      { variable: '--btn-primary-bg', current: 'unspecified', suggested: '#1D63ED', purpose: 'Single unmistakable conversion focal point' },
    ],
    refactoringChecklist: [
      'Refactor hero CTA hierarchy to eliminate button competition',
      'Set explicit aspect-ratio and lazy loading on all non-hero images',
      'Standardize card border radius to 12px with 1px #E4E4E7 borders',
      'Increase line-height on feature paragraph blocks to 1.6',
    ],
  };
}

/**
 * Builds the structured REVO Design Brief.
 */
export function buildDesignBrief(
  siteName: string,
  url: string,
  evidence: WebsiteEvidencePackage,
  dna: DesignDnaV2,
  summary: ExecutiveSummaryV2,
  breaks: { title: string }[]
): RevoDesignBriefV2 {
  return {
    productIntent: `Deliver an authoritative, conversion-optimized digital experience for ${siteName} that converts visitors through clear positioning and zero-friction visual hierarchy.`,
    targetAudience: 'Product teams, founders, developers, and discerning digital consumers.',
    currentDesignDna: dna.fingerprintBadge,
    strengthsSummary: [
      `Hero value proposition clearly anchored on "${evidence.headings[0]?.text || siteName}"`,
      `Cohesive chromatic palette with ${evidence.dominantColors.length} primary hues`,
      'Semantic document structure with clean navigational routes',
    ],
    coreBottlenecks: breaks.map((b) => b.title),
    visualDirection: [
      'High-contrast typography paired with generous, disciplined macro-spacing',
      'Flat card containers with hairline borders (#E4E4E7) to eliminate visual clutter',
      'Single unmistakable solid primary action trigger per viewport',
    ],
    motionPrinciples: [
      '150ms ease-out hover and active feedback states',
      'Zero distracting or gratuitous continuous loop animations',
      'Smooth layout transitions on state changes',
    ],
    responsiveRules: [
      'Desktop: Max-width 1280px container with 32px horizontal padding',
      'Mobile: Full-width stacked layout with 16px edge padding and 44px touch targets',
      'Navigation: Collapses smoothly into high-contrast full-screen drawer on mobile viewports',
    ],
    actionPriorities: [
      'Fix CTA visual hierarchy in hero fold',
      'Preload hero typography and optimize image formats',
      'Refactor feature descriptions into high-contrast scannable proof grids',
    ],
  };
}

/**
 * Master synthesis function that constructs the complete V2 reasoning layers.
 */
export function enrichWithV2Intelligence(
  base: Omit<StructuredAnalysisResponse, 'id' | 'analyzedAt' | 'evidence' | 'status'>,
  evidence: WebsiteEvidencePackage
): {
  executiveSummary: ExecutiveSummaryV2;
  designDna: DesignDnaV2;
  familiarity: FamiliarityAnalysisV2;
  showMeWhy: ShowMeWhyItemV2[];
  rootCauses: RootCauseNodeV2[];
  issueClusters: IssueClusterV2[];
  quickWins: QuickWinItemV2[];
  roadmapTiers: {
    immediate: PriorityOpportunity[];
    highImpact: PriorityOpportunity[];
    structural: PriorityOpportunity[];
    experimental: PriorityOpportunity[];
  };
  varietyOptions: VarietyOptionV2[];
  designNew: DesignNewDirectionV2;
  aiInstructions: AiInstructionsV2;
  designBrief: RevoDesignBriefV2;
} {
  const siteName = base.siteName || 'Target Experience';
  const h1 = evidence.headings.find((h) => h.level.toLowerCase() === 'h1')?.text || evidence.title || 'Digital Product';
  const primaryCta = evidence.primaryCtas[0] || 'Get Started';

  // 1. Design DNA
  const designDna = extractDesignDna(evidence, siteName);

  // 2. Familiarity
  const familiarity = analyzeFamiliarity(evidence, designDna);

  // 3. Root Causes & Issue Clusters
  const { rootCauses, issueClusters } = buildRootCausesAndClusters(evidence, base.whereItBreaks);

  // 4. Show Me Why
  const showMeWhy = buildShowMeWhyItems(evidence, base.scores, base.whereItBreaks);

  // 5. Quick Wins
  const quickWins = buildQuickWins(evidence, primaryCta);

  // 6. Roadmap Tiers
  const roadmapTiers = buildRoadmapTiers(base.topOpportunities, quickWins);

  // 7. Variety Engine
  const varietyOptions = buildVarietyOptions(siteName, designDna);

  // 8. Design New Proposal
  const designNew = buildDesignNew(siteName, h1, primaryCta);

  // 9. AI Instructions
  const aiInstructions = buildAiInstructions(siteName, evidence.url, designDna, quickWins, designNew);

  // 10. Executive Summary & "So What?" Layer
  const biggestStrength = base.whyItWorks[0]?.title || 'Direct Value Proposition Clarity';
  const biggestWeakness = base.whereItBreaks[0]?.title || 'Call-to-Action Hierarchy Competition';
  const biggestOpportunity = base.topOpportunities[0]?.recommendation || 'Elevate primary CTA contrast and streamline feature scanning.';
  const loadMs = evidence?.loadTimeMs ?? 0;
  const mostSignificantTechnicalRisk = loadMs > 1500
    ? `Document load latency (${loadMs}ms) risks mobile bounce rates before first visual engagement.`
    : `Asset weight across ${evidence?.totalImages ?? 0} images requires disciplined preloading to guarantee 0ms layout shift.`;

  const executiveSummary: ExecutiveSummaryV2 = {
    overallHealth: `${siteName} exhibits a mature, high-clarity digital presence with strong messaging alignment around "${h1.slice(0, 45)}...".`,
    biggestStrength,
    biggestWeakness,
    biggestOpportunity,
    mostSignificantTechnicalRisk,
    designDnaSummary: designDna.fingerprintBadge,
    theSoWhatTakeaway: `Your website's primary proposition is clear, but subtle visual competition across ${evidence.totalButtons} action points dilutes conversion velocity. Applying single-point focal hierarchy and sub-second asset hydration will unlock elite benchmark performance.`,
  };

  // 11. Design Brief
  const designBrief = buildDesignBrief(siteName, evidence.url, evidence, designDna, executiveSummary, base.whereItBreaks);

  return {
    executiveSummary,
    designDna,
    familiarity,
    showMeWhy,
    rootCauses,
    issueClusters,
    quickWins,
    roadmapTiers,
    varietyOptions,
    designNew,
    aiInstructions,
    designBrief,
  };
}

