import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/i18n/server";

// Meta (Facebook) Pixel ID — sadece ziyaretçiye açık site için, admin paneli
// tarafında yüklenmez (bkz. aşağıdaki yorum).
const META_PIXEL_ID = "2338527013646602";

// Ziyaretçiye açık site kabuğu (Header/Sidebar/Footer). Admin panelinin
// (app/(admin)/admin/layout.tsx) bu kabukla hiçbir ilişkisi yoktur.
//
// Dijital pazarlama/izleme scriptleri (Meta Pixel, Yandex Metrica vb.) kasıtlı
// olarak buraya, admin ile paylaşılan app/layout.tsx yerine ekleniyor: sadece
// gerçek ziyaretçi/dönüşüm trafiğini izlemek istiyoruz, admin panel
// kullanımını değil.
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

            {/* Meta Pixel Code */}
            <Script id="meta-pixel" strategy="afterInteractive">
                {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
                `}
            </Script>
            <noscript>
                <img
                    height={1}
                    width={1}
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
            {/* End Meta Pixel Code */}
        </LocaleProvider>
    );
}
