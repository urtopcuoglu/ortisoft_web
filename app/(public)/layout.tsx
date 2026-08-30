import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

// Ziyaretçiye açık site kabuğu (Header/Sidebar/Footer). Admin panelinin
// (app/(admin)/admin/layout.tsx) bu kabukla hiçbir ilişkisi yoktur.
export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <Sidebar />
            <main className="flex-1 content-area">{children}</main>
            <Footer />
        </>
    );
}
