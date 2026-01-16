'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to main dashboard - admin content is now role-based in /dashboard
export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'rgba(255, 255, 255, 0.7)'
    }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
