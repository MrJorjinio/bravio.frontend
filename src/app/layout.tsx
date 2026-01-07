import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bravio - Master Any Content 10x Faster",
  description: "AI-powered platform that breaks down complex content into clear summaries, essential key points, and interactive flashcards. Learn smarter, not harder.",
  keywords: ["AI summarizer", "key points extraction", "flashcards", "study tool", "content breakdown", "learning platform"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>
        <GoogleOAuthWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
