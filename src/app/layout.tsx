import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PranaProvider } from "@/context/PranaContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PranaSync — Bio-Environmental Ayurvedic Guide",
  description:
    "PranaSync compares your Ayurvedic constitution with local weather, air quality and your body's signals to show where your balance is shifting and what to do next. Private by default, with optional AI guidance.",
  keywords: ["Ayurveda", "Prakriti", "Vikriti", "dosha", "biohacking", "air quality", "circadian"],
  authors: [{ name: "PranaSync" }],
  openGraph: {
    title: "PranaSync — Bio-Environmental Ayurvedic Guide",
    description:
      "Your constitution. Your climate. One live harmony signal.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white antialiased`}>
        <PranaProvider>
          <TooltipProvider>
            <Toaster />
            {children}
          </TooltipProvider>
        </PranaProvider>
      </body>
    </html>
  );
}
