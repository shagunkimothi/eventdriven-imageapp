import React from 'react';
import { FileImage } from 'lucide-react';

export const ComparisonView = ({ image }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOptimized = image.status === 'COMPLETED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      
      {/* Side-by-Side Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Original Image Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Original Image</span>
            <span className="font-mono text-slate-300">{formatBytes(image.metrics?.originalSizeBytes)}</span>
          </div>
          <div className="aspect-[16/10] bg-slate-950 border border-slate-800 rounded-md overflow-hidden flex items-center justify-center">
            {image.originalUrl ? (
              <img src={image.originalUrl} alt="Original raw" className="w-full h-full object-contain" />
            ) : (
              <FileImage className="w-8 h-8 text-slate-700" />
            )}
          </div>
        </div>

        {/* Optimized Image Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Optimized Image</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {isOptimized ? formatBytes(image.metrics?.optimizedSizeBytes) : 'Pending'}
            </span>
          </div>
          <div className="aspect-[16/10] bg-slate-950 border border-slate-800 rounded-md overflow-hidden flex items-center justify-center">
            {image.processedUrl ? (
              <img src={image.processedUrl} alt="Optimized output" className="w-full h-full object-contain" />
            ) : <div className="text-center">
              <FileImage className="w-8 h-8 text-slate-700 mx-auto" />
              <span className="text-xs text-slate-500 font-mono block mt-2">
                Processing...
              </span>
            </div>}
          </div>
        </div>

      </div>

      {/* Comparison Callout: e.g. 85.4% smaller */}
      {isOptimized && image.metrics?.reductionPercentage && (
        <div className="text-center py-2 bg-slate-950 border border-slate-800 rounded-md">
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {image.metrics.reductionPercentage}% smaller
          </span>
          <span className="text-xs text-slate-400 ml-2">
            ({formatBytes(image.metrics?.savedBytes)} saved)
          </span>
        </div>
      )}

    </div>
  );
};
