import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { Trash2, Download, FileImage } from 'lucide-react';

export const ImageCard = ({ image, onDelete }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOptimized = image.status === 'COMPLETED';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors">
      
      {/* Original and optimized images */}
      <div className="relative grid grid-cols-2 gap-px aspect-[16/10] bg-slate-800 border-b border-slate-800">
        <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden">
          {image.originalUrl ? (
            <img src={image.originalUrl} alt={`Original ${image.filename}`} className="w-full h-full object-cover" />
          ) : (
            <FileImage className="w-8 h-8 text-slate-700" />
          )}
          <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-slate-950/80 text-[9px] text-slate-300">
            Original
          </span>
        </div>
        <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden">
          {image.processedUrl ? (
            <img src={image.processedUrl} alt={`Optimized ${image.filename}`} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <FileImage className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-[9px] text-slate-600 mt-1">Pending</p>
            </div>
          )}
          <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-slate-950/80 text-[9px] text-slate-300">
            Optimized
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <StatusBadge status={image.status} />
        </div>
        {image.outputFormat && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300 border border-slate-800">
            {image.outputFormat.toUpperCase()}
          </span>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-medium text-xs sm:text-sm text-white truncate" title={image.filename}>
            {image.filename}
          </h4>

          {/* Size Metrics */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Original</span>
              <span className="text-slate-300 font-medium">
                {formatBytes(image.metrics?.originalSizeBytes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Optimized</span>
              <span className={isOptimized ? "text-emerald-400 font-medium" : "text-slate-500"}>
                {isOptimized ? formatBytes(image.metrics?.optimizedSizeBytes) : 'Pending'}
              </span>
            </div>
          </div>

          {/* Reduction Percentage */}
          {isOptimized && image.metrics?.reductionPercentage && (
            <div className="mt-2 text-xs font-mono">
              <span className="text-emerald-400 font-semibold">
                {image.metrics.reductionPercentage}% reduction
              </span>
              <span className="text-slate-500 ml-1">
                ({formatBytes(image.metrics?.savedBytes)} saved)
              </span>
            </div>
          )}

          {/* AI Labels (Secondary) */}
          {image.aiAnalysis?.rekognition?.labels && (
            <div className="mt-2 flex flex-wrap gap-1">
              {image.aiAnalysis.rekognition.labels.slice(0, 3).map((lbl, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60"
                >
                  {lbl.name} ({Number(lbl.confidence).toFixed(1)}%)
                </span>
              ))}
            </div>
          )}
          {image.aiCaption && (
            <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
              {image.aiCaption}
            </p>
          )}
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <Link
            to={`/images/${image.id}`}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Details
          </Link>

          <div className="flex items-center gap-1">
            {isOptimized && image.processedUrl && (
              <a
                href={image.processedUrl}
                target="_blank"
                rel="noreferrer"
                download={image.filename}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => onDelete(image.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
