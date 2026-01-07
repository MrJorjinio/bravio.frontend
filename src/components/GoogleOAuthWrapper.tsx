'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode, useEffect } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '25371385865-oof7r93urpoebvddpc7q5inaa29mmsaj.apps.googleusercontent.com';

interface GoogleOAuthWrapperProps {
  children: ReactNode;
}

export function GoogleOAuthWrapper({ children }: GoogleOAuthWrapperProps) {
  useEffect(() => {
    console.log('Google OAuth initialized with client ID:', GOOGLE_CLIENT_ID);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}

export default GoogleOAuthWrapper;
