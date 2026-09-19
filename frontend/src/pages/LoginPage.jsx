import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, FileImage, KeyRound, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, signup, confirmSignup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    let result;
    if (mode === 'signin') {
      result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      }
    } else if (mode === 'signup') {
      result = await signup(email, password, name);
      if (result.success) {
        setMessage(result.message);
        setMode(result.userConfirmed ? 'signin' : 'confirm');
      }
    } else {
      result = await confirmSignup(email, confirmCode);
      if (result.success) {
        setMessage(result.message);
        setMode('signin');
        setConfirmCode('');
      }
    }

    if (result && !result.success) setError(result.error);
    setIsLoading(false);
  };

  const isConfirming = mode === 'confirm';
  const isSigningUp = mode === 'signup';

  return (
    <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-5">
          <FileImage className="w-6 h-6 mx-auto text-slate-400 mb-3" />
          <h1 className="text-lg font-semibold text-white">
            Serverless Image Optimization & Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isConfirming ? 'Verify your email address' : isSigningUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          {!isConfirming && (
            <div className="flex border-b border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 pb-2 text-xs font-medium border-b-2 ${
                  !isSigningUp ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 pb-2 text-xs font-medium border-b-2 ${
                  isSigningUp ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Create account
              </button>
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-md border border-emerald-800 bg-emerald-950/40 p-2.5 text-xs text-emerald-300">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-rose-800 bg-rose-950/40 p-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSigningUp && (
              <label className="block">
                <span className="block text-xs font-medium text-slate-300 mb-1.5">Full name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </label>
            )}

            <label className="block">
              <span className="block text-xs font-medium text-slate-300 mb-1.5">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </label>

            {isConfirming ? (
              <label className="block">
                <span className="block text-xs font-medium text-slate-300 mb-1.5">Verification code</span>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={confirmCode}
                    onChange={(event) => setConfirmCode(event.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </label>
            ) : (
              <label className="block">
                <span className="block text-xs font-medium text-slate-300 mb-1.5">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isConfirming ? 'Verify email' : isSigningUp ? 'Create account' : 'Sign in'}</span>}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {isConfirming ? (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full mt-4 text-xs text-slate-500 hover:text-slate-300"
            >
              Already verified? Sign in
            </button>
          ) : (
            <p className="text-center text-xs text-slate-500 mt-4">
              {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => switchMode(isSigningUp ? 'signin' : 'signup')}
                className="text-blue-400 hover:text-blue-300"
              >
                {isSigningUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
