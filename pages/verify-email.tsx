import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query; // Token from the query
  const [status, setStatus] = useState('Verifying...');
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  useEffect(() => {
    if (token && isButtonClicked) {
      // Call API to verify email once the user clicks the button
      fetch(`/api/verify?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus('Email verified successfully. You can now log in!');
          } else {
            setStatus(`Verification failed: ${data.message}`);
          }
        })
        .catch(() => setStatus('An error occurred during verification.'));
    }
  }, [token, isButtonClicked]);

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{status}</p>
      {!isButtonClicked && (
        <button
          onClick={() => setIsButtonClicked(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Verify Email
        </button>
      )}
    </div>
  );
}
