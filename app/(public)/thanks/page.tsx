import Link from "next/link";
import { SiteLayout } from "@/components/site-layout";

export default function ThanksPage() {
  return (
    <SiteLayout>
      <main className="container-app py-16">
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Thanks — your quote request is in.</h1>
          <p className="mt-3">Next step: We’ll call you shortly to confirm details and availability.</p>
          <Link href="/" className="mt-6 inline-block rounded bg-brand px-4 py-2 font-semibold text-white">Back to home</Link>
        </div>
      </main>
    </SiteLayout>
  );
}
