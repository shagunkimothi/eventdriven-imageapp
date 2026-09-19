import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserImages } from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ArrowRight, RefreshCw, Upload } from 'lucide-react';

export const DashboardPage = () => {
  const { token } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadImages();
  }, [token]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserImages(token);
      setImages(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute metrics requested by user
  const totalCount = images.length;
  const optimizedImages = images.filter((img) => img.status === 'COMPLETED');
  const processingCount = images.filter((img) => img.status === 'PROCESSING').length;

  const totalSavedBytes = images.reduce(
    (acc, img) => acc + (img.metrics?.savedBytes || 0), 
    0
  );

  const avgReduction = optimizedImages.length > 0
    ? (
        optimizedImages.reduce((acc, img) => acc + (img.metrics?.reductionPercentage || 0), 0) /
        optimizedImages.length
      ).toFixed(1)
    : '0.0';

  const formatMegabytes = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Image Optimization Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Serverless image size reduction, compression metrics, and AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadImages}
            className="p-2 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </Link>
        </div>
      </div>

      {/* Main 4 Statistics Cards */}
      {error && (
        <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Images Processed"
          value={totalCount}
          unit="files"
          subtitle={`${optimizedImages.length} completed`}
        />
        <StatCard
          title="Storage Saved"
          value={formatMegabytes(totalSavedBytes)}
          unit="MB"
          subtitle="Reduced S3 storage footprint"
        />
        <StatCard
          title="Average Reduction"
          value={`${avgReduction}%`}
          subtitle="Pillow optimization"
        />
        <StatCard
          title="Processing"
          value={processingCount}
          unit="active"
          subtitle={processingCount > 0 ? "Queued in pipeline" : "No active jobs"}
        />
      </div>

      {/* Clean Technical Architecture Pipeline Section */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white">Event-Driven Architecture</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Deployed AWS implementation flow
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
            Live API
          </span>
        </div>

        {/* Clean, Simple Flow Diagram */}
        <div className="overflow-x-auto py-2">
          <div className="flex items-center min-w-[760px] gap-2 text-xs font-mono text-slate-300">
            {[
              { name: "Cognito", desc: "Auth" },
              { name: "API Gateway", desc: "Presign" },
              { name: "S3", desc: "Raw" },
              { name: "SQS", desc: "Queue & DLQ" },
              { name: "Lambda", desc: "Pillow" },
              { name: "S3", desc: "Optimized" },
              { name: "Rekognition", desc: "Vision" },
              { name: "Bedrock", desc: "Description" },
              { name: "DynamoDB", desc: "Metadata" },
            ].map((node, i, arr) => (
              <React.Fragment key={node.name + i}>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-md p-2.5 text-center">
                  <div className="font-semibold text-slate-200">{node.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{node.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-slate-600 font-sans font-bold flex-shrink-0">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Recent Images</h3>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>View all in Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Filename</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Original Size</th>
                <th className="py-2.5 px-4">Optimized Size</th>
                <th className="py-2.5 px-4">Reduction</th>
                <th className="py-2.5 px-4">Output Format</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {images.slice(0, 5).map((img) => {
                const isOptimized = img.status === 'COMPLETED';
                return (
                  <tr key={img.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white truncate max-w-[200px]">
                      {img.filename}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={img.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {formatBytes(img.metrics?.originalSizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {isOptimized ? formatBytes(img.metrics?.optimizedSizeBytes) : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {isOptimized && img.metrics?.reductionPercentage ? (
                        <span className="font-semibold text-emerald-400">
                          {img.metrics.reductionPercentage}% reduction
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {img.outputFormat || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/images/${img.id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
