import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPresignedUrl, waitForProcessing } from '../services/api';
import { uploadFileToS3 } from '../services/s3Upload';
import { DropZone } from '../components/upload/DropZone';
import { UploadSettings } from '../components/upload/UploadSettings';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [settings, setSettings] = useState({
    format: 'WEBP',
    quality: 80,
    resizeMaxDimension: 1920,
    preserveExif: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadState, setUploadState] = useState('idle');
  const [progressStatus, setProgressStatus] = useState('');
  const [resultItem, setResultItem] = useState(null);
  const [error, setError] = useState(null);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setResultItem(null);
    setError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setResultItem(null);
    setError(null);
    setProgressStatus('');
    setUploadState('idle');
  };

  const handleOptimize = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadState('uploading');
    setError(null);
    setProgressStatus('Generating presigned S3 URL...');

    try {
      // 1. Get presigned URL
      const presignData = await requestPresignedUrl(selectedFile, settings);
      setProgressStatus('Uploading to S3 raw bucket...');

      // 2. Direct S3 Upload
      await uploadFileToS3(selectedFile, presignData.uploadUrl, settings, (pct) => {
        setProgressStatus(`Uploading to S3 (${pct}%)...`);
      });

      setProgressStatus('Upload successful. Processing has started...');
      setUploadState('uploaded');
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadState('processing');
      setProgressStatus('Processing image with the backend...');
      const completedItem = await waitForProcessing(presignData.fileName, {
        onStatus: (status) => setProgressStatus(`Processing status: ${status}`),
      });

      if (completedItem.processingStatus === 'FAILED') {
        throw new Error('Image processing failed in the backend.');
      }

      setResultItem(completedItem);
      setUploadState('completed');
      setProgressStatus('');
      setIsProcessing(false);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Optimization failed');
      setUploadState('failed');
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Simple Page Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Upload Image</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload an image for server-side optimization and analysis.
        </p>
      </div>

      {/* Optimization Completed Summary Banner */}
      {resultItem && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Processing Complete</span>
          </div>

          {/* Key Optimization Results Requested by User */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-md border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Original Size</span>
              <span className="text-white font-medium">{formatBytes(resultItem.metrics?.originalSizeBytes)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Optimized Size</span>
              <span className="text-emerald-400 font-bold">{formatBytes(resultItem.metrics?.optimizedSizeBytes)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Bytes Saved</span>
              <span className="text-white font-medium">{formatBytes(resultItem.metrics?.savedBytes)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Reduction</span>
              <span className="text-emerald-400 font-bold">
                {resultItem.metrics?.reductionPercentage}% reduction
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 font-mono">
              Output: <strong className="text-slate-200">{resultItem.outputFormat || '—'}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFileRemove}
                className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Upload Another
              </button>
              <Link
                to={`/images/${resultItem.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="space-y-4">
        <DropZone
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          disabled={isProcessing}
        />

        {selectedFile && !resultItem && (
          <>
            <UploadSettings
              settings={settings}
              onChange={setSettings}
              disabled={isProcessing}
            />

            {error && (
              <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            )}

            {isProcessing && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-md flex items-center gap-2 text-xs font-mono text-amber-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadState === 'uploaded' ? 'Upload successful. Processing has started...' : progressStatus}</span>
              </div>
            )}

            {/* Optimize Button */}
            <button
              onClick={handleOptimize}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Optimize Image</span>
              )}
            </button>
          </>
        )}
      </div>

    </div>
  );
};
