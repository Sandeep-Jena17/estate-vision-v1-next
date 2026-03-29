import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EstateVision — Premium Real Estate Platform Bhubaneswar',
    template: '%s | EstateVision',
  },
  description: 'Find verified properties in Bhubaneswar and Odisha. AI-powered recommendations, RERA certified listings.',
  keywords: ['real estate bhubaneswar', 'property in odisha', 'buy flat bhubaneswar', 'RERA certified'],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <div className="App">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
