import { GoogleGenAI } from '@google/genai';
import { StructuredAnalysisResponse } from '../../src/types.js';
import { REVO_CONFIG } from '../config.js';

export interface AskRevoRequest {
  question: string;
  analysis: StructuredAnalysisResponse;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  ownerId?: string;
}

export async function handleAskRevo(req: AskRevoRequest): Promise<{
  answer: string;
  citedEvidence: string[];
  suggestedFollowUps: string[];
}> {
  const { question, analysis } = req;

  // Sanitize and bound input question
  const cleanQuestion = (question || '')
    .trim()
    .slice(0, 1000)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  if (!cleanQuestion) {
    return {
      answer: 'Please provide a specific question about this website.',
      citedEvidence: [],
      suggestedFollowUps: ['How can I improve conversion velocity?'],
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      answer: generateDeterministicAnswer(cleanQuestion, analysis),
      citedEvidence: extractRelevantEvidence(cleanQuestion, analysis),
      suggestedFollowUps: generateFollowUps(cleanQuestion, analysis),
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const ev = analysis?.evidence;
    const evidenceSummary = `
WEBSITE: ${analysis.siteName || 'Target Site'} (${analysis.url || ''})
PRIMARY GOAL: ${analysis.primaryGoal || 'Visitor Engagement'} (Confidence: ${analysis.goalConfidence || 0.85})
DIAGNOSIS: ${analysis.overallDiagnosis || 'Diagnosis complete'}

DESIGN DNA:
- Style: ${analysis.designDna?.typography?.style || 'Modern Product'}
- Density: ${analysis.designDna?.density?.level || 'balanced'}
- Palette: ${(ev?.dominantColors || []).join(', ') || 'Standard'}

OBSERVED FACTS:
- Load Duration: ${ev?.loadTimeMs ?? 0}ms
- Headings (${ev?.headings?.length ?? 0}): ${(ev?.headings || []).slice(0, 5).map((h) => `${h.level}: ${h.text}`).join(' | ')}
- Buttons (${ev?.totalButtons ?? 0}): CTAs = ${(ev?.primaryCtas || []).join(', ')}
- Links: ${ev?.totalLinks ?? 0}
- Images: ${ev?.totalImages ?? 0}
- PageSpeed Performance: ${ev?.pageSpeedMetrics?.performance ?? 'N/A'}

KEY STRENGTHS:
${(analysis.whyItWorks || []).map((w) => `- ${w.title}: ${w.explanation}`).join('\n')}

KEY BOTTLENECKS:
${(analysis.whereItBreaks || []).map((b) => `- ${b.title}: ${b.explanation}`).join('\n')}
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
<user_question>
${cleanQuestion}
</user_question>

Provide your answer in a concise, authoritative, structured response.
    `.trim();

    const candidateModels = Array.from(
      new Set([process.env.GEMINI_MODEL, ...REVO_CONFIG.GEMINI.CANDIDATE_MODELS].filter(Boolean) as string[])
    );

    let text = '';
    for (const model of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Ask REVO timeout')), 12000)
        );

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
        text = (response?.text || '').trim();
        if (text) break;
      } catch (err) {
        console.warn(`[Ask REVO] Model ${model} failed:`, err instanceof Error ? err.message : err);
      }
    }

    const answerText = text || generateDeterministicAnswer(cleanQuestion, analysis);
    return {
      answer: answerText,
      citedEvidence: extractRelevantEvidence(cleanQuestion, analysis),
      suggestedFollowUps: generateFollowUps(cleanQuestion, analysis),
    };
  } catch (err) {
    console.warn('[Ask REVO] Gemini fallback triggered:', err instanceof Error ? err.message : err);
    return {
      answer: generateDeterministicAnswer(cleanQuestion, analysis),
      citedEvidence: extractRelevantEvidence(cleanQuestion, analysis),
      suggestedFollowUps: generateFollowUps(cleanQuestion, analysis),
    };
  }
}

function generateDeterministicAnswer(question: string, analysis: StructuredAnalysisResponse): string {
  const q = question.toLowerCase();
  const ev = analysis?.evidence;
  const h1 = ev?.headings?.[0]?.text || analysis?.siteName || 'Website';
  const cta = ev?.primaryCtas?.[0] || 'Primary Action';

  if (q.includes('hero') || q.includes('headline') || q.includes('above the fold')) {
    return `The hero section for ${analysis?.siteName || 'this website'} is anchored by the headline "${h1}". While the positioning is clear, the primary conversion path is challenged by ${ev?.totalButtons ?? 0} competing buttons across the fold. To maximize conversion velocity, keep "${cta}" as the single high-contrast solid button and demote secondary navigation elements to outline styles.`;
  }

  if (q.includes('speed') || q.includes('performance') || q.includes('lcp') || q.includes('slow') || q.includes('load')) {
    return `The initial document load completed in ${ev?.loadTimeMs ?? 0}ms with ${ev?.totalImages ?? 0} images. The primary bottleneck is initial asset delivery and font stabilization. Preload hero typography and ensure explicit width/height dimensions on all images to eliminate layout shift (CLS).`;
  }

  if (q.includes('typography') || q.includes('font') || q.includes('readable') || q.includes('text')) {
    return `${analysis?.siteName || 'This website'} utilizes ${ev?.headings?.length ?? 0} detected heading tiers with ${analysis.designDna?.typography.style || 'product-focused display typography'}. To improve rapid scanning, constrain body copy line lengths to 65–75 characters and maintain a 1.25+ step ratio between H2 headings and paragraph text.`;
  }

  if (q.includes('convert') || q.includes('cta') || q.includes('button') || q.includes('lead')) {
    return `Conversion velocity is governed by action trajectory clarity. The page contains ${ev?.totalButtons ?? 0} buttons and ${ev?.totalLinks ?? 0} links. We recommend consolidating the primary conversion trajectory around "${cta}" with a bold contrasting fill (#1D63ED) and 12px 24px padding.`;
  }

  return `Based on REVO's live inspection of ${analysis?.siteName || 'the site'} (${analysis?.url || ''}): The site demonstrates a ${analysis.designDna?.density.level || 'balanced'} visual density with ${ev?.headings?.length ?? 0} headings and ${ev?.totalButtons ?? 0} interactive controls. The most impactful immediate change is addressing ${analysis.topOpportunities?.[0]?.problem || 'CTA visual competition'} to elevate conversion clarity.`;
}

function extractRelevantEvidence(question: string, analysis: StructuredAnalysisResponse): string[] {
  const evidence: string[] = [];
  const ev = analysis?.evidence;
  evidence.push(`Observed Load Time: ${ev?.loadTimeMs ?? 0}ms`);
  evidence.push(`DOM Elements: ${ev?.totalButtons ?? 0} buttons, ${ev?.totalLinks ?? 0} links, ${ev?.headings?.length ?? 0} headings`);
  if (ev?.primaryCtas && ev.primaryCtas.length > 0) {
    evidence.push(`Primary CTA: "${ev.primaryCtas[0]}"`);
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
