import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
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

const DEFAULT_DESCRIPTION =
  "Website profil resmi Kelurahan Mlokomanis Kulon, Kecamatan Ngadirojo, Kabupaten Wonogiri — informasi layanan, berita, struktur pemerintahan, wilayah RW, UMKM, dan program Kampung KB.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Kelurahan Mlokomanis Kulon",
    "Ngadirojo",
    "Wonogiri",
    "Jawa Tengah",
    "profil desa",
    "layanan kelurahan",
    "Kampung KB",
    "UMKM Wonogiri",
  ],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    url: "/",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/images/logo-wonogiri.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const governmentOfficeJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOffice",
  name: SITE_NAME,
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kantor Kelurahan Mlokomanis Kulon",
    addressLocality: "Ngadirojo",
    addressRegion: "Wonogiri, Jawa Tengah",
    postalCode: "57681",
    addressCountry: "ID",
  },
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

      <body className="min-h-full flex flex-col">
        <JsonLd data={governmentOfficeJsonLd} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
