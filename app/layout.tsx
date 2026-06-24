import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Script from "next/script";

export const metadata: Metadata = {
    title: "Ortisoft | Dijital Dönüşüm & Yazılım Danışmanlığı",
    description:
        "Proje danışmanlığı, yazılım danışmanlığı ve dijital pazarlama hizmetleriyle işletmenizi geleceğe taşıyoruz.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className="h-full antialiased">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-3S604E3LCC"
                strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3S604E3LCC');
          `}
            </Script>
        </head>
        <body className="min-h-full flex flex-col">
        <Header />
        <Sidebar />
        <main className="flex-1 content-area">{children}</main>
        <Footer />
        </body>
        </html>
    );
}