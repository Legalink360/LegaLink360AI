'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { resendVerificationEmail, onAuthStateChange } from '@/lib/auth';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Check if email is already verified
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user && user.emailVerified) {
        setVerificationComplete(true);
        // Redirect to login in 2 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address is missing');
      return;
    }

    setResending(true);
    setError(null);

    try {
      const response = await resendVerificationEmail(email);

      if (!response.success) {
        setError(response.message);
        setResending(false);
        return;
      }

      // Start countdown
      setCountdown(60);
      setResending(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
      setResending(false);
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

          {/* Verification Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-4">
            {verificationComplete ? (
              <>
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Email Verified!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Your email has been verified successfully. Redirecting to login...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Verify Your Email
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    We have sent a verification link to:
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {email || 'your email address'}
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
                  <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                    <li>1. Check your email inbox (and spam folder)</li>
                    <li>2. Click the verification link in the email</li>
                    <li>3. Return here to sign in to your account</li>
                  </ol>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Resend Button */}
                <button
                  onClick={handleResendEmail}
                  disabled={resending || countdown > 0}
                  className="w-full bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-600 text-slate-900 dark:text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
                >
                  {resending ? (
                    <span className="flex items-center justify-center">
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Sending...
                    </span>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>

                {/* Sign In Link */}
                <div className="text-center mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Already verified?{' '}
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Contact Support */}
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              Did not receive the email?{' '}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
