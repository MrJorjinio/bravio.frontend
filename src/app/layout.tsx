import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${plusJakarta.variable} antialiased`}>
        <GoogleOAuthWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
