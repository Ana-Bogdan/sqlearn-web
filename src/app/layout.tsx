import type { Metadata } from "next";
import { Albert_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const albertSans = Albert_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Elagern is reserved exclusively for the SQLearn wordmark.
const elagern = localFont({
  src: [
    {
      path: "./fonts/Elagern.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Elagern-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SQLearn",
  description: "A gamified SQL e-learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${jetbrainsMono.variable} ${elagern.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
