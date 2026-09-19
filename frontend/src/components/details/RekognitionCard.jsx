import React from 'react';

export const RekognitionCard = ({ rekognitionData }) => {
  if (!rekognitionData || !rekognitionData.labels) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs text-slate-500 font-mono">
        Rekognition analysis pending or unavailable.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-sm font-semibold text-white">Image Analysis (Rekognition)</h3>
        <span className="text-[11px] text-slate-500 font-mono">Detected Labels</span>
      </div>

      <div className="divide-y divide-slate-800/60">
        {rekognitionData.labels.map((label, idx) => (
          <div key={idx} className="py-2 flex items-center justify-between text-xs">
            <span className="text-slate-200 font-medium">{label.name}</span>
            <span className="text-slate-400 font-mono">{Number(label.confidence).toFixed(1)}% confidence</span>
          </div>
        ))}
      </div>
    </div>
  );
};
