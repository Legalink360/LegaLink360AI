import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "LegaLink360 AI",
  description: "Your intelligent legal assistant by LegaLink & Co. Advocates - providing accessible legal guidance and support.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo/LegaLink360-192.png",
  },
  manifest: "/manifest.json",
  other: {
    "openai-domain-verification": process.env.NEXT_PUBLIC_OPENAI_DOMAIN_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
