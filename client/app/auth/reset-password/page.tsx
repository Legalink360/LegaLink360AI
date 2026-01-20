'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { sendPasswordResetEmail } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);

    try {
      const response = await sendPasswordResetEmail(email);

      if (!response.success) {
        setError(response.message);
        setLoading(false);
        return;
      }

      setStep('sent');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
                LegaLink360
              </h1>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              AI-Powered Legal Assistant
            </p>
          </div>

          {/* Reset Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-4">
            {step === 'email' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Reset Your Password
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Remember your password?{' '}
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Reset Link Sent
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white mb-6">
                    {email}
                  </p>

                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6 text-left">
                    <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                      <li>1. Check your email inbox (and spam folder)</li>
                      <li>2. Click the reset link in the email</li>
                      <li>3. Enter your new password</li>
                      <li>4. Sign in with your new password</li>
                    </ol>
                  </div>

                  {/* Back to Login */}
                  <Link
                    href="/auth/login"
                    className="inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-center"
                  >
                    Back to Sign In
                  </Link>

                  {/* Try Again */}
                  <button
                    onClick={() => {
                      setStep('email');
                      setEmail('');
                      setError(null);
                    }}
                    className="block w-full mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm py-2"
                  >
                    Try a different email
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Contact Support */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              Didn't receive the email?{' '}
              <a
                href="mailto:support@legalink360.com"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
