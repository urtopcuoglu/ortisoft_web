import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/i18n/server";

// Ziyaretçiye açık site kabuğu (Header/Sidebar/Footer). Admin panelinin
// (app/(admin)/admin/layout.tsx) bu kabukla hiçbir ilişkisi yoktur.
export default async function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { locale, messages } = await getMessages();

    return (
        <LocaleProvider locale={locale} messages={messages}>
            <Header />
            <Sidebar />
            <main className="flex-1 content-area">{children}</main>
            <Footer />
        </LocaleProvider>
    );
}
