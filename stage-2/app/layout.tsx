import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stage 2 - Overlap Analytics Redesign",
  description: "Technical assessment starter for a one-screen video analytics redesign."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
