import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAManager } from "@/components/providers/pwa-manager";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
export const metadata: Metadata = {
  title: "Rimev",
  description: "Mobile-first personal spaced repetition learning app",
  manifest: '/manifest.webmanifest',
  applicationName: 'Rimev',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rimev",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Rimev',
  },
};

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('rimev-theme');
    if (theme !== 'light') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rimev" />
        <meta name="application-name" content="Rimev" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <PWAManager />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
