import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stage 1 - Realtime Background Blur",
  description: "Technical assessment starter for live camera background blur."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Extensions like Grammarly add attributes to <body> before hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
