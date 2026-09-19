import React, { useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

export const DropZone = ({ selectedFile, onFileSelect, onFileRemove, disabled }) => {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file) => {
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file (JPEG, PNG, WebP).");
      return;
    }
    onFileSelect(file);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      {!selectedFile ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-700 bg-slate-900 rounded-lg p-8 text-center cursor-pointer hover:border-slate-600 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled}
          />
          <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-medium text-white">
            Drag and drop an image here, or <span className="text-blue-400 underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports JPEG, PNG, WebP (Max 25 MB)
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {formatBytes(selectedFile.size)} • {selectedFile.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>
          </div>

          {!disabled && (
            <button
              onClick={onFileRemove}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
