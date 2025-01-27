import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (token) {
      // Call the backend API to verify the token
      fetch(`/api/verify?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus('Email verified successfully. You can now log in.');
          } else {
            setStatus(`Verification failed: ${data.message}`);
          }
        })
        .catch(() => setStatus('An error occurred during verification.'));
    }
  }, [token]);

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{status}</p>
    </div>
  );
}
