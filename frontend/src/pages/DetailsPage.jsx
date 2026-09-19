import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageDetails, deleteImage } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { ComparisonView } from '../components/details/ComparisonView';
import { RekognitionCard } from '../components/details/RekognitionCard';
import { BedrockCard } from '../components/details/BedrockCard';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  HardDrive, 
  Percent, 
  Clock, 
  Database, 
  FileCode, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Share2
} from 'lucide-react';

export const DetailsPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  useEffect(() => {
    loadImageDetails();
  }, [id, token]);

  const loadImageDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getImageDetails(id, token);
      setImage(data);
    } catch (err) {
      setError(err.message || 'Image not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this image from S3 raw, S3 processed, and DynamoDB?")) {
      return;
    }
    try {
      await deleteImage(id, token);
      navigate('/gallery');
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading image metadata from DynamoDB...</p>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Image Not Found</h2>
        <p className="text-xs text-slate-400">{error || "Requested image record does not exist."}</p>
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-xs text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gallery</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate max-w-md sm:max-w-lg">
              {image.filename}
            </h1>
            <StatusBadge status={image.status} />
          </div>
          <p className="text-xs text-slate-400 font-mono">
            ID: {image.id} • Uploaded: {new Date(image.uploadedAt).toLocaleString()}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {image.processedUrl && (
            <a
              href={image.processedUrl}
              target="_blank"
              rel="noreferrer"
              download={image.filename}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Optimized</span>
            </a>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Original Payload</span>
          <p className="text-lg font-bold text-white mt-1">
            {formatBytes(image.metrics?.originalSizeBytes)}
          </p>
          <span className="text-[10px] text-slate-500">Source image</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30">
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Optimized Payload</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            {formatBytes(image.metrics?.optimizedSizeBytes) || 'Pending'}
          </p>
          <span className="text-[10px] text-slate-500">
            {image.outputFormat ? image.outputFormat.toUpperCase() : 'Pending'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Size Reduction</span>
          <p className="text-lg font-bold text-white mt-1">
            {image.metrics?.reductionPercentage ? `-${image.metrics.reductionPercentage}%` : '0%'}
          </p>
          <span className="text-[10px] text-slate-500">
            {formatBytes(image.metrics?.savedBytes)} saved
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Lambda Duration</span>
          <p className="text-lg font-bold text-amber-400 mt-1">
            {image.metrics?.processingDurationMs ? `${image.metrics.processingDurationMs} ms` : '—'}
          </p>
          <span className="text-[10px] text-slate-500">Pillow + AI inference</span>
        </div>
      </div>

      {/* Visual Comparison Canvas */}
      <ComparisonView image={image} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['Quality', image.quality ? `${image.quality}%` : '—'],
          ['Max Dimension', image.maxDimension ? `${image.maxDimension}px` : '—'],
          ['Processing Status', image.status || '—'],
          ['Upload Timestamp', image.uploadedAt ? new Date(image.uploadedAt).toLocaleString() : '—'],
        ].map(([label, value]) => (
          <div key={label} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{label}</span>
            <p className="text-sm font-semibold text-white mt-1 break-words">{value}</p>
          </div>
        ))}
      </div>

      {/* AI Analysis Grid: Rekognition + Bedrock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RekognitionCard rekognitionData={image.aiAnalysis?.rekognition} />
        <BedrockCard bedrockData={image.aiAnalysis?.bedrock} />
      </div>

      {/* DynamoDB Document Inspector (Placement Viva Defense Showcase) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <button
          onClick={() => setShowJsonInspector(!showJsonInspector)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200">
              DynamoDB Document Schema & Item Inspector
            </h4>
            <span className="text-[10px] font-mono text-slate-500">(PK: USER#... | SK: IMAGE#...)</span>
          </div>
          {showJsonInspector ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showJsonInspector && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 font-mono text-xs text-amber-300/90 overflow-x-auto">
            <pre className="text-[11px] leading-relaxed">
              {JSON.stringify(
                {
                  ImageId: image.id,
                  OriginalFileName: image.originalFileName,
                  ProcessedFileName: image.processedFileName,
                  ProcessingStatus: image.processingStatus,
                  UploadTimestamp: image.uploadTimestamp,
                  OriginalSize: image.originalSize,
                  OptimizedSize: image.optimizedSize,
                  SizeReductionPercent: image.sizeReductionPercent,
                  SourceBucket: image.sourceBucket,
                  DestinationBucket: image.destinationBucket,
                  RekognitionLabels: image.rekognitionLabels,
                  AiCaption: image.aiCaption,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
