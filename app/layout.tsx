import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
    title: "Ortisoft | Dijital Dönüşüm & Yazılım Danışmanlığı",
    description:
        "Proje danışmanlığı, yazılım danışmanlığı ve dijital pazarlama hizmetleriyle işletmenizi geleceğe taşıyoruz.",
};

// Bu, tüm site için ortak (public + admin) minimal kabuktur: html/head/font.
// Sayfa-özel görünüm (Header/Sidebar/Footer vs. admin sidebar) alt route group
// layout'larında (app/(public)/layout.tsx, app/(admin)/admin/layout.tsx) tanımlanır.
// GA4/Meta Pixel/Yandex Metrica gibi izleme scriptleri kasıtlı olarak burada
// değil, app/(public)/layout.tsx içinde — admin panel kullanımı hiçbirine
// gitmesin diye.
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className="h-full antialiased" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className="min-h-full flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
