import { GoogleGenAI } from '@google/genai';
import { StructuredAnalysisResponse } from '../../src/types.js';

export interface AskRevoRequest {
  question: string;
  analysis: StructuredAnalysisResponse;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export async function handleAskRevo(req: AskRevoRequest): Promise<{
  answer: string;
  citedEvidence: string[];
  suggestedFollowUps: string[];
}> {
  const { question, analysis, conversationHistory = [] } = req;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      answer: generateDeterministicAnswer(question, analysis),
      citedEvidence: extractRelevantEvidence(question, analysis),
      suggestedFollowUps: generateFollowUps(question, analysis),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const evidenceSummary = `
WEBSITE: ${analysis.siteName} (${analysis.url})
PRIMARY GOAL: ${analysis.primaryGoal} (Confidence: ${analysis.goalConfidence})
DIAGNOSIS: ${analysis.overallDiagnosis}

DESIGN DNA:
- Style: ${analysis.designDna?.typography.style || 'Modern Product'}
- Density: ${analysis.designDna?.density.level || 'balanced'}
- Palette: ${analysis.evidence.dominantColors.join(', ')}

OBSERVED FACTS:
- Load Duration: ${analysis.evidence.loadTimeMs}ms
- Headings (${analysis.evidence.headings.length}): ${analysis.evidence.headings.slice(0, 5).map((h) => `${h.level}: ${h.text}`).join(' | ')}
- Buttons (${analysis.evidence.totalButtons}): CTAs = ${analysis.evidence.primaryCtas.join(', ')}
- Links: ${analysis.evidence.totalLinks}
- Images: ${analysis.evidence.totalImages}
- Lighthouse Performance: ${analysis.evidence.pageSpeedMetrics?.performance ?? 'N/A'}

KEY STRENGTHS:
${analysis.whyItWorks.map((w) => `- ${w.title}: ${w.explanation}`).join('\n')}

KEY BOTTLENECKS:
${analysis.whereItBreaks.map((b) => `- ${b.title}: ${b.explanation}`).join('\n')}
    `.trim();

    const prompt = `
You are REVO V2, an elite website reasoning and design intelligence engine.
THINK TECHNICALLY. SPEAK HUMANLY.
You are answering a specific developer/designer question about the website: ${analysis.siteName} (${analysis.url}).

GROUNDING DIRECTIVES:
1. Ground every claim directly in the observed evidence. Never invent fake metrics or hallucinate features that were not detected.
2. Follow the REVO chain of reasoning: Problem -> Evidence -> Root Cause -> Recommendation.
3. Be concise, direct, and actionable. Avoid generic fluff or boilerplate praise ("Great question!").
4. If asked how to fix something, give exact CSS values, layout tokens, or DOM hierarchy adjustments.

EVIDENCE PACKAGE:
${evidenceSummary}

USER QUESTION:
${question}

Provide your answer in a concise, authoritative, structured format.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || generateDeterministicAnswer(question, analysis);
    return {
      answer: text,
      citedEvidence: extractRelevantEvidence(question, analysis),
      suggestedFollowUps: generateFollowUps(question, analysis),
    };
  } catch (err) {
    console.warn('[Ask REVO] Gemini fallback triggered:', err instanceof Error ? err.message : err);
    return {
      answer: generateDeterministicAnswer(question, analysis),
      citedEvidence: extractRelevantEvidence(question, analysis),
      suggestedFollowUps: generateFollowUps(question, analysis),
    };
  }
}

function generateDeterministicAnswer(question: string, analysis: StructuredAnalysisResponse): string {
  const q = question.toLowerCase();
  const h1 = analysis.evidence.headings[0]?.text || analysis.siteName;
  const cta = analysis.evidence.primaryCtas[0] || 'Primary Action';

  if (q.includes('hero') || q.includes('headline') || q.includes('above the fold')) {
    return `The hero section for ${analysis.siteName} is anchored by the headline "${h1}". While the positioning is clear, the primary conversion path is challenged by ${analysis.evidence.totalButtons} competing buttons across the fold. To maximize conversion velocity, keep "${cta}" as the single high-contrast solid button and demote secondary navigation elements to outline styles.`;
  }

  if (q.includes('speed') || q.includes('performance') || q.includes('lcp') || q.includes('slow') || q.includes('load')) {
    return `The initial document load completed in ${analysis.evidence.loadTimeMs}ms with ${analysis.evidence.totalImages} images. The primary bottleneck is initial asset delivery and font stabilization. Preload hero typography and ensure explicit width/height dimensions on all images to eliminate layout shift (CLS).`;
  }

  if (q.includes('typography') || q.includes('font') || q.includes('readable') || q.includes('text')) {
    return `${analysis.siteName} utilizes ${analysis.evidence.headings.length} detected heading tiers with ${analysis.designDna?.typography.style || 'product-focused display typography'}. To improve rapid scanning, constrain body copy line lengths to 65–75 characters and maintain a 1.25+ step ratio between H2 headings and paragraph text.`;
  }

  if (q.includes('convert') || q.includes('cta') || q.includes('button') || q.includes('lead')) {
    return `Conversion velocity is governed by action trajectory clarity. The page contains ${analysis.evidence.totalButtons} buttons and ${analysis.evidence.totalLinks} links. We recommend consolidating the primary conversion trajectory around "${cta}" with a bold contrasting fill (#1D63ED) and 12px 24px padding.`;
  }

  return `Based on REVO's live inspection of ${analysis.siteName} (${analysis.url}): The site demonstrates a ${analysis.designDna?.density.level || 'balanced'} visual density with ${analysis.evidence.headings.length} headings and ${analysis.evidence.totalButtons} interactive controls. The most impactful immediate change is addressing ${analysis.topOpportunities[0]?.problem || 'CTA visual competition'} to elevate conversion clarity.`;
}

function extractRelevantEvidence(question: string, analysis: StructuredAnalysisResponse): string[] {
  const evidence: string[] = [];
  evidence.push(`Observed Load Time: ${analysis.evidence.loadTimeMs}ms`);
  evidence.push(`DOM Elements: ${analysis.evidence.totalButtons} buttons, ${analysis.evidence.totalLinks} links, ${analysis.evidence.headings.length} headings`);
  if (analysis.evidence.primaryCtas.length > 0) {
    evidence.push(`Primary CTA: "${analysis.evidence.primaryCtas[0]}"`);
  }
  return evidence;
}

function generateFollowUps(question: string, analysis: StructuredAnalysisResponse): string[] {
  return [
    'How do I fix the hero visual hierarchy in Tailwind CSS?',
    'What is the biggest technical bottleneck slowing down this site?',
    'How does this site compare to modern design benchmarks?',
  ];
}
