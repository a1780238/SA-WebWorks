import "./globals.css";
import type { Metadata } from "next";
import { tenantConfig } from "@/config/tenant";

export const metadata: Metadata = {
  title: `${tenantConfig.businessName} | Get Booked. Not Stressed.`,
  description: tenantConfig.hero.subheading
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
