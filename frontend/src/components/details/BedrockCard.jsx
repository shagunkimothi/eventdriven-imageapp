import React from 'react';

export const BedrockCard = ({ bedrockData }) => {
  if (!bedrockData || !bedrockData.description) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs text-slate-500 font-mono">
        Bedrock description pending or unavailable.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-sm font-semibold text-white">AI Description (Bedrock)</h3>
        <span className="text-[11px] text-slate-500 font-mono">Model: Amazon Nova 2 Lite (Bedrock)</span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800 font-sans">
        "{bedrockData.description}"
      </p>
    </div>
  );
};
