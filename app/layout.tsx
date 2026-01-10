import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LegaLink360 AI",
  description: "Your intelligent legal assistant by LegaLink & Co. Advocates - providing accessible legal guidance and support.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
