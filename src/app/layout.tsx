import type { Metadata } from "next";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import { ScrollAnimationProvider } from "@/components/animations/ScrollAnimationProvider";
import "./globals.css";

const surgena = localFont({
  src: "./fonts/Surgena.ttf",
  variable: "--font-surgena",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "G&B Builders | Architecture, Interiors & Turnkey Construction",
  description:
    "We design and build your house, from bare land. Bespoke architecture, refined interiors, and turnkey construction by G&B Builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${surgena.variable} ${outfit.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-bg-base text-fg-base font-sans antialiased"
      >
        <ScrollAnimationProvider>
          {children}
        </ScrollAnimationProvider>
      </body>
    </html>
  );
}
