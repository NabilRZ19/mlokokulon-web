import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kelurahan Mlokomanis Kulon",
  description: "Website profil resmi Kelurahan Mlokomanis Kulon, Kec. Ngadirojo, Kab. Wonogiri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${lexend.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="http://76.13.191.42:9000" />
        <link rel="dns-prefetch" href="http://76.13.191.42:9000" />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
