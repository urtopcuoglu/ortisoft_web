import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/i18n/server";

// Google Analytics 4 measurement ID — önceden app/layout.tsx'te (public+admin
// ortak kabukta) tanımlıydı; admin panel kullanımının GA4'e gitmemesi için
// buraya, Meta Pixel/Yandex Metrica ile aynı yere taşındı.
const GA4_MEASUREMENT_ID = "G-3S604E3LCC";

// Meta (Facebook) Pixel ID — sadece ziyaretçiye açık site için, admin paneli
// tarafında yüklenmez (bkz. aşağıdaki yorum).
const META_PIXEL_ID = "2338527013646602";

// Yandex Metrica sayaç ID'si — Meta Pixel ile aynı gerekçeyle sadece burada.
const YANDEX_METRICA_ID = "112295745";

// Ziyaretçiye açık site kabuğu (Header/Sidebar/Footer). Admin panelinin
// (app/(admin)/admin/layout.tsx) bu kabukla hiçbir ilişkisi yoktur.
//
// Dijital pazarlama/izleme scriptleri (GA4, Meta Pixel, Yandex Metrica vb.)
// kasıtlı olarak buraya, admin ile paylaşılan app/layout.tsx yerine
// ekleniyor: sadece gerçek ziyaretçi/dönüşüm trafiğini izlemek istiyoruz,
// admin panel kullanımını değil.
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

            {/* Google Analytics 4 */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_MEASUREMENT_ID}');
                `}
            </Script>

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

            {/* Yandex.Metrika counter */}
            <Script id="yandex-metrica" strategy="afterInteractive">
                {`
                (function(m,e,t,r,i,k,a){
                    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                    m[i].l=1*new Date();
                    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRICA_ID}', 'ym');

                ym(${YANDEX_METRICA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
                `}
            </Script>
            <noscript>
                <div>
                    <img
                        src={`https://mc.yandex.ru/watch/${YANDEX_METRICA_ID}`}
                        style={{ position: "absolute", left: "-9999px" }}
                        alt=""
                    />
                </div>
            </noscript>
            {/* /Yandex.Metrika counter */}
        </LocaleProvider>
    );
}
