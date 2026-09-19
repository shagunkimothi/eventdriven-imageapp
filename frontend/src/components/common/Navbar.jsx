import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AWS_CONFIG } from '../../config/aws-config';
import { Image as ImageIcon, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload', path: '/upload' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Project Branding */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm sm:text-base text-white tracking-tight block leading-tight">
                  Serverless Image Optimization & Analysis
                </span>
                <span className="text-[11px] text-slate-400 font-mono block leading-tight">
                  AWS Serverless Platform
                </span>
              </div>
            </Link>

            {AWS_CONFIG.USE_MOCK && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 border border-slate-700 text-amber-400 ml-2">
                Local Demo Mode
              </span>
            )}
          </div>

          {/* Simple Navigation */}
          {isAuthenticated && (
            <nav className="flex items-center gap-1 sm:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      active
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User / Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800 text-xs text-slate-300">
                <span className="hidden sm:inline font-medium text-slate-200">
                  {user?.name || user?.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors text-xs"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
