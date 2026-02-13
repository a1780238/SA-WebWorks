import Link from "next/link";
import { tenantConfig } from "@/config/tenant";

const links = [
  ["/", "Home"],
  ["/services", "Services"],
  ["/areas", "Areas"],
  ["/pricing", "Pricing"],
  ["/about", "About"],
  ["/contact", "Contact"]
] as const;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Link href="/" className="font-bold">{tenantConfig.businessName}</Link>
          <nav className="hidden gap-4 text-sm md:flex">
            {links.map(([href, label]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
          <a href={`tel:${tenantConfig.phone}`} className="rounded bg-slate-900 px-3 py-2 text-xs font-semibold text-white md:text-sm">Call</a>
        </div>
      </header>
      {children}
      <footer className="mt-16 border-t bg-white">
        <div className="container-app py-8 text-sm text-slate-600">
          <p>{tenantConfig.businessName} • {tenantConfig.address}</p>
          <div className="mt-2 flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
