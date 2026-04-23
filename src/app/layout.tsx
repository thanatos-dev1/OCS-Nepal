import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OCS Nepal — Genuine PC Components",
  description:
    "Shop genuine computer hardware in Nepal. RAM, SSDs, hard drives, keyboards, and more. Official warranty on all products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-slate-900 font-sans">
        <Navbar />
        <span className="bg-red-300 absolute z-10">sdfsdf</span>

        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
