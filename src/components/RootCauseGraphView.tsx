import React from 'react';
import { GitBranch, AlertTriangle, ArrowRight, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { RootCauseNodeV2, IssueClusterV2 } from '../types';

interface RootCauseGraphViewProps {
  rootCauses?: RootCauseNodeV2[];
  issueClusters?: IssueClusterV2[];
  siteName: string;
}

export const RootCauseGraphView: React.FC<RootCauseGraphViewProps> = ({
  rootCauses = [],
  issueClusters = [],
  siteName,
}) => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E4E7] pb-6">
        <div className="flex items-center space-x-2 text-xs text-[#1D63ED] font-semibold uppercase tracking-wider">
          <GitBranch className="w-4 h-4" />
          <span>Root Cause Graph & Issue Clustering</span>
        </div>
        <h3 className="font-display text-3xl font-extrabold text-[#111827]">
          Technical ↔ Visual Dependency Chains
        </h3>
        <p className="text-sm text-[#71717A] max-w-3xl">
          Symptoms are clustered by underlying engineering root causes. See how asset delivery, DOM structure, and CSS class rules translate directly into UX friction and conversion drops.
        </p>
      </div>

      {/* Issue Clusters */}
      <div className="space-y-6">
        <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
          Clustered Issue Graphs ({issueClusters.length})
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {issueClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-7 space-y-5 hover:border-[#D4D4D8] transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#E4E4E7] pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    Severity: {cluster.severity}
                  </span>
                  <h4 className="font-bold text-base text-[#111827] mt-1">
                    {cluster.rootIssue}
                  </h4>
                </div>
              </div>

              {/* Technical ↔ Visual Link */}
              {cluster.technicalVisualRelationship && (
                <div className="p-4 bg-white border border-[#E4E4E7] rounded-xl text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-[#1D63ED]">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Technical → Visual Causal Link</span>
                  </div>
                  <p className="text-[#52525B] leading-relaxed">
                    {cluster.technicalVisualRelationship}
                  </p>
                </div>
              )}

              {/* Clustered Symptoms */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-[#71717A] block">
                  Observed Surface Symptoms ({(cluster.symptoms || []).length}):
                </span>
                <ul className="space-y-1.5">
                  {(cluster.symptoms || []).map((symptom, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-[#52525B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Root Resolution */}
              <div className="pt-3 border-t border-[#E4E4E7] space-y-1.5 text-xs">
                <span className="font-semibold text-emerald-800 block">
                  Single Root Fix:
                </span>
                <p className="text-[#111827] font-medium leading-relaxed">
                  {cluster.recommendedRootFix}
                </p>
                <div className="pt-1 text-[11px] text-[#71717A]">
                  <span className="font-medium text-[#52525B]">Expected Impact: </span>
                  <span>{cluster.expectedResult}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Root Cause Dependency Nodes */}
      {rootCauses.length > 0 && (
        <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs text-[#1D63ED] font-semibold uppercase tracking-wider block">
              Node Architecture
            </span>
            <h4 className="font-display text-xl font-bold text-[#111827]">
              Causal Chain Trajectories
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rootCauses.map((rc) => (
              <div key={rc.id} className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">{rc.title}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F4F4F5] text-[#71717A]">
                    {rc.category}
                  </span>
                </div>
                <p className="text-xs text-[#52525B] leading-relaxed">{rc.description}</p>
                <div className="pt-2 border-t border-[#F4F4F5] space-y-1 text-xs">
                  <span className="font-semibold text-[#71717A] text-[11px]">Downstream Impact:</span>
                  {(rc.downstreamEffects || []).map((eff, eIdx) => (
                    <div key={eIdx} className="flex items-start space-x-1.5 text-[#52525B]">
                      <ArrowRight className="w-3.5 h-3.5 text-[#1D63ED] shrink-0 mt-0.5" />
                      <span>{eff}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
