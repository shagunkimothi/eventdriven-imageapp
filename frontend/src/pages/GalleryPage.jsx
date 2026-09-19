import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUserImages, deleteImage } from '../services/api';
import { FilterBar } from '../components/gallery/FilterBar';
import { ImageCard } from '../components/gallery/ImageCard';
import { RefreshCw, Upload } from 'lucide-react';

export const GalleryPage = () => {
  const { token } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadImages();

    // Auto-refresh interval to detect status transition
    const interval = setInterval(() => {
      loadImages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

  const loadImages = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const data = await fetchUserImages(token);
      setImages(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load images.');
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm("Delete this image?")) {
      return;
    }

    try {
      await deleteImage(imageId, token);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Filtering
  const filteredImages = images.filter((img) => {
    if (statusFilter !== 'ALL' && img.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      const matchFilename = img.filename?.toLowerCase().includes(query);
      const matchLabels = img.aiAnalysis?.rekognition?.labels?.some((lbl) =>
        lbl.name.toLowerCase().includes(query)
      );
      return matchFilename || matchLabels;
    }

    return true;
  });

  // Sorting
  filteredImages.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    } else if (sortBy === 'reduction') {
      return (b.metrics?.reductionPercentage || 0) - (a.metrics?.reductionPercentage || 0);
    } else if (sortBy === 'size') {
      return (b.metrics?.originalSizeBytes || 0) - (a.metrics?.originalSizeBytes || 0);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Image Gallery</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your optimized images, inspect compression statistics, and download outputs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadImages(true)}
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

      {/* Filter and Search Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        totalCount={images.length}
      />

      {error && (
        <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Grid or Empty State */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-500 font-mono">
          Loading images...
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center space-y-3">
          <p className="text-sm font-medium text-white">No images found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? "No images match your active filters."
              : "Upload an image to start optimizing."}
          </p>
          <Link
            to="/upload"
            className="inline-block px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors"
          >
            Upload an image
          </Link>
        </div>
      )}

    </div>
  );
};
