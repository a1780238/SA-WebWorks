"use client";

import Script from "next/script";
import { tenantConfig } from "@/config/tenant";

export function TrackingScripts() {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return null;

  return (
    <>
      {tenantConfig.analytics.ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${tenantConfig.analytics.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${tenantConfig.analytics.ga4Id}');`}
          </Script>
        </>
      )}
      {tenantConfig.analytics.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${tenantConfig.analytics.metaPixelId}'); fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}

export function trackClientEvent(event: "call_click" | "quote_submit" | "quote_success" | "deposit_paid") {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.gtag) w.gtag("event", event);
  if (w.fbq) w.fbq("trackCustom", event);
}
