import React from 'react';

export const UploadSettings = ({ settings, onChange, disabled }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
        Optimization Settings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Output Format */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Output Format
          </label>
          <select
            disabled={disabled}
            value={settings.format}
            onChange={(e) => onChange({ ...settings, format: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="WEBP">WebP (Recommended)</option>
            <option value="JPEG">JPEG</option>
            <option value="PNG">PNG</option>
          </select>
        </div>

        {/* Quality */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-400">Quality</label>
            <span className="text-xs font-mono font-medium text-slate-200">{settings.quality}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="5"
            disabled={disabled}
            value={settings.quality}
            onChange={(e) => onChange({ ...settings, quality: parseInt(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded cursor-pointer mt-2"
          />
        </div>

        {/* Resize Dimensions */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Resize Max Dimension
          </label>
          <select
            disabled={disabled}
            value={settings.resizeMaxDimension}
            onChange={(e) => onChange({ ...settings, resizeMaxDimension: parseInt(e.target.value) })}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="1920">1920px (Full HD)</option>
            <option value="1280">1280px (Standard Web)</option>
            <option value="2560">2560px (2K)</option>
            <option value="0">Original Resolution</option>
          </select>
        </div>
      </div>
    </div>
  );
};
