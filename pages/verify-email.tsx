'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Waiting for verification');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [verificationState, setVerificationState] = useState('pending'); // pending, success, error

  useEffect(() => {
    if (token && isButtonClicked) {
      setVerificationState('loading');
      fetch(`/api/verify?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus('Email verified successfully. You can now log in!');
            setVerificationState('success');
          } else {
            setStatus(`Verification failed: ${data.message}`);
            setVerificationState('error');
          }
        })
        .catch(() => {
          setStatus('An error occurred during verification.');
          setVerificationState('error');
        });
    }
  }, [token, isButtonClicked]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Welcome to Email Verification
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-6">
                {verificationState === 'pending' && (
                  <div className="h-16 w-16 mx-auto text-blue-500">
                    <CheckCircle className="h-full w-full" />
                  </div>
                )}
                {verificationState === 'loading' && (
                  <div className="h-16 w-16 mx-auto text-blue-500 animate-spin">
                    <Loader2 className="h-full w-full" />
                  </div>
                )}
                {verificationState === 'success' && (
                  <div className="h-16 w-16 mx-auto text-green-500">
                    <CheckCircle className="h-full w-full" />
                  </div>
                )}
                {verificationState === 'error' && (
                  <div className="h-16 w-16 mx-auto text-red-500">
                    <XCircle className="h-full w-full" />
                  </div>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-6">{status}</p>
            </div>
            
            {!isButtonClicked && (
              <button
                onClick={() => setIsButtonClicked(true)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
                          transition-colors duration-200 transform hover:scale-105 focus:outline-none 
                          focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Verify Email
              </button>
            )}
            
            {verificationState === 'success' && (
              <Link 
                href="/login"
                className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium 
                          rounded-lg transition-colors duration-200 transform hover:scale-105 
                          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-center"
              >
                Proceed to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}