import React from 'react';
import { Palette, Type, Box, Grid, Activity, Compass, ShieldAlert, Sparkles } from 'lucide-react';
import { DesignDnaV2, FamiliarityAnalysisV2, WebsiteEvidencePackage } from '../types';

interface DesignDnaViewProps {
  dna?: DesignDnaV2;
  familiarity?: FamiliarityAnalysisV2;
  evidence: WebsiteEvidencePackage;
  siteName: string;
}

export const DesignDnaView: React.FC<DesignDnaViewProps> = ({
  dna,
  familiarity,
  evidence,
  siteName,
}) => {
  if (!dna) return null;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E4E7] pb-6">
        <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Visual & Architectural Genome</span>
        </div>
        <h3 className="font-display text-3xl font-extrabold text-[#111827]">
          Design DNA & Visual Language
        </h3>
        <p className="text-sm text-[#71717A] max-w-3xl">
          The underlying mathematical, typographic, and geometric blueprint governing {siteName}'s visual hierarchy and emotional feel.
        </p>
      </div>

      {/* DNA Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Typography */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2.5 text-[#111827] font-bold text-sm">
            <Type className="w-4 h-4 text-[#1D63ED]" />
            <span>Typography System</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#71717A] block font-medium">Style Archetype</span>
              <span className="text-[#111827] font-semibold">{dna.typography.style}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Detected Hierarchy</span>
              <span className="text-[#52525B]">{dna.typography.headingHierarchy}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Contrast & Rhythm</span>
              <span className="text-[#52525B]">{dna.typography.rhythm}</span>
            </div>
          </div>
        </div>

        {/* Geometry & Radii */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2.5 text-[#111827] font-bold text-sm">
            <Box className="w-4 h-4 text-[#1D63ED]" />
            <span>Geometry & Elevation</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#71717A] block font-medium">Corner Radii</span>
              <span className="text-[#111827] font-semibold">{dna.geometry.cornerRadius}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Card Framing</span>
              <span className="text-[#52525B]">{dna.geometry.cardStyle}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Border Logic</span>
              <span className="text-[#52525B]">{dna.geometry.borderTreatment}</span>
            </div>
          </div>
        </div>

        {/* Density & Spacing */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2.5 text-[#111827] font-bold text-sm">
            <Grid className="w-4 h-4 text-[#1D63ED]" />
            <span>Density & Spacing Rhythm</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#71717A] font-medium">Density Level</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1D63ED] font-bold uppercase text-[10px]">
                {dna.density.level}
              </span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Spacing Math</span>
              <span className="text-[#52525B]">{dna.density.spacingRhythm}</span>
            </div>
          </div>
        </div>

        {/* Composition & Layout */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2.5 text-[#111827] font-bold text-sm">
            <Compass className="w-4 h-4 text-[#1D63ED]" />
            <span>Composition & Pacing</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#71717A] block font-medium">Layout Grid</span>
              <span className="text-[#111827] font-semibold">{dna.composition.layoutPattern}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Focal Trajectory</span>
              <span className="text-[#52525B]">{dna.composition.focalBalance}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Negative Space Math</span>
              <span className="text-[#52525B]">{dna.composition.negativeSpaceUsage}</span>
            </div>
          </div>
        </div>

        {/* Palette & Chromatic Strategy */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2.5 text-[#111827] font-bold text-sm">
            <Palette className="w-4 h-4 text-[#1D63ED]" />
            <span>Color Profile & Contrast</span>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#71717A] block font-medium mb-1.5">Dominant Palette Swatches</span>
              <div className="flex items-center space-x-2">
                {dna.colorProfile.dominantPalette.map((color, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-1">
                    <div
                      className="w-7 h-7 rounded-lg border border-[#E4E4E7] shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <span className="font-mono text-[9px] text-[#71717A]">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Accent Strategy</span>
              <span className="text-[#52525B]">{dna.colorProfile.accentStrategy}</span>
            </div>
          </div>
        </div>

        {/* Motion & Interaction */}
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-6 space-y-4 hover:border-[#D4D4D8] transition-colors">
          <div className="flex items-center space-x-2.5 text-[#111827] font-bold text-sm">
            <Activity className="w-4 h-4 text-[#1D63ED]" />
            <span>Motion & Tactile Response</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#71717A] block font-medium">Transition Duration</span>
              <span className="text-[#111827] font-semibold">{dna.motion.presence}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Micro-interactions</span>
              <span className="text-[#52525B]">{dna.motion.interactionStyle}</span>
            </div>
            <div>
              <span className="text-[#71717A] block font-medium">Archetype</span>
              <span className="text-[#111827] font-semibold">{dna.visualTone.archetype}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Familiarity & Distinctiveness Section */}
      {familiarity && (
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Familiarity vs. Distinctiveness Analysis</span>
              </div>
              <h4 className="font-display text-xl font-bold text-[#111827]">
                Pattern Memorability Rating
              </h4>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-[#71717A] font-medium">Classification:</span>
              <span className="px-3 py-1 rounded-md bg-[#111827] text-white text-xs font-bold capitalize">
                {familiarity.classification}
              </span>
              <span className="font-display text-2xl font-extrabold text-[#111827]">
                {familiarity.score.toFixed(1)}
                <span className="text-xs font-normal text-[#71717A]">/10</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Overused patterns */}
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-[#111827]">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Conventional / Template Patterns</span>
              </div>
              <p className="text-[#52525B] leading-relaxed">{familiarity.cons}</p>
              <ul className="space-y-1.5 pt-2 border-t border-[#F4F4F5]">
                {familiarity.overusedPatterns.map((pat, idx) => (
                  <li key={idx} className="text-[#52525B] flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Distinctive elements */}
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-[#111827]">
                <Sparkles className="w-4 h-4 text-[#1D63ED] shrink-0" />
                <span>Signature Distinctive Elements</span>
              </div>
              <p className="text-[#52525B] leading-relaxed">{familiarity.pros}</p>
              <ul className="space-y-1.5 pt-2 border-t border-[#F4F4F5]">
                {familiarity.distinctiveElements.map((elem, idx) => (
                  <li key={idx} className="text-[#52525B] flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED] shrink-0"></span>
                    <span>{elem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-white border border-[#E4E4E7] rounded-xl text-xs text-[#52525B] flex items-start space-x-3">
            <span className="font-bold text-[#111827] shrink-0">Design Strategy:</span>
            <span>{familiarity.recommendation}</span>
          </div>
        </div>
      )}
    </div>
  );
};
