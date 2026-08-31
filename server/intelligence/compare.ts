import { BeforeAfterComparisonV2, StructuredAnalysisResponse } from '../../src/types.js';

export function compareTwoAnalyses(
  base: StructuredAnalysisResponse,
  target: StructuredAnalysisResponse
): BeforeAfterComparisonV2 {
  const baseDna = base.designDna;
  const targetDna = target.designDna;

  const sharedDna: string[] = [];
  const baseDistinct: string[] = [];
  const comparisonDistinct: string[] = [];
  const fusionOpportunities: string[] = [];
  const dnaConflicts: string[] = [];

  // Compare density
  if (baseDna?.density.level === targetDna?.density.level) {
    sharedDna.push(`Matching Density Level: ${baseDna?.density.level.toUpperCase()}`);
  } else {
    baseDistinct.push(`Base Density: ${baseDna?.density.level || 'balanced'}`);
    comparisonDistinct.push(`Comparison Density: ${targetDna?.density.level || 'compact'}`);
  }

  // Compare color mode
  if (baseDna?.colorProfile.mode === targetDna?.colorProfile.mode) {
    sharedDna.push(`Coordinated Chromatic Palette (${baseDna?.colorProfile.mode.toUpperCase()} mode)`);
  } else {
    dnaConflicts.push(`Incompatible Color Ground: ${base.siteName} is ${baseDna?.colorProfile.mode} vs ${target.siteName} is ${targetDna?.colorProfile.mode}`);
  }

  // Compare typography
  if (baseDna?.typography.style.includes('Editorial') && targetDna?.typography.style.includes('Product')) {
    fusionOpportunities.push(`Fuse ${target.siteName}'s punchy product typography scale with ${base.siteName}'s storytelling structure.`);
  } else {
    fusionOpportunities.push(`Adopt ${target.siteName}'s high-contrast button styling into ${base.siteName}'s layout.`);
  }

  // Scores
  const baseClarity = base.scores?.clarity?.score ?? 7.0;
  const targetClarity = target.scores?.clarity?.score ?? 7.0;
  const baseCraft = base.scores?.craft?.score ?? 7.0;
  const targetCraft = target.scores?.craft?.score ?? 7.0;

  const baseAdvantage: string[] = [];
  const comparisonAdvantage: string[] = [];

  if (baseClarity >= targetClarity) {
    baseAdvantage.push(`Higher Clarity (${baseClarity.toFixed(1)} vs ${targetClarity.toFixed(1)})`);
  } else {
    comparisonAdvantage.push(`Superior Proposition Clarity (${targetClarity.toFixed(1)} vs ${baseClarity.toFixed(1)})`);
  }

  if (baseCraft >= targetCraft) {
    baseAdvantage.push(`Sharper Craft Precision (${baseCraft.toFixed(1)} vs ${targetCraft.toFixed(1)})`);
  } else {
    comparisonAdvantage.push(`Refined Typographic & Visual Craft (${targetCraft.toFixed(1)} vs ${baseCraft.toFixed(1)})`);
  }

  let strategicVerdict = '';
  if (targetClarity + targetCraft > baseClarity + baseCraft) {
    strategicVerdict = `${target.siteName} demonstrates a more cohesive visual hierarchy and conversion trajectory. ${base.siteName} can achieve comparable performance by adopting ${target.siteName}'s single-action focal discipline.`;
  } else {
    strategicVerdict = `${base.siteName} holds superior visual clarity. ${target.siteName} introduces useful secondary scannability patterns that can be selectively integrated.`;
  }

  return {
    baseSite: {
      url: base.url,
      name: base.siteName,
      clarityScore: baseClarity,
      craftScore: baseCraft,
      dnaSummary: baseDna?.fingerprintBadge || 'Base DNA Fingerprint',
    },
    comparisonSite: {
      url: target.url,
      name: target.siteName,
      clarityScore: targetClarity,
      craftScore: targetCraft,
      dnaSummary: targetDna?.fingerprintBadge || 'Comparison DNA Fingerprint',
    },
    sharedDna: sharedDna.length > 0 ? sharedDna : ['Standard web semantic navigation hierarchy', 'Product feature card groupings'],
    distinctDna: {
      baseDistinct: baseDistinct.length > 0 ? baseDistinct : [`${base.siteName}'s bespoke layout pacing`],
      comparisonDistinct: comparisonDistinct.length > 0 ? comparisonDistinct : [`${target.siteName}'s distinctive button contrast`],
    },
    fusionOpportunities: fusionOpportunities.length > 0 ? fusionOpportunities : ['Cross-pollinate button padding and hero typography scaling.'],
    dnaConflicts: dnaConflicts.length > 0 ? dnaConflicts : ['No critical architectural conflicts detected.'],
    strengthsComparison: {
      baseAdvantage: baseAdvantage.length > 0 ? baseAdvantage : ['Solid foundation layout'],
      comparisonAdvantage: comparisonAdvantage.length > 0 ? comparisonAdvantage : ['Sharp visual contrast'],
    },
    strategicVerdict,
  };
}
