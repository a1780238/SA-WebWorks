import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="container-app py-16">
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold">Thanks — we’ve received your request.</h1>
        <p className="mt-3">A team member will contact you shortly.</p>
        <Link href="/" className="mt-6 inline-block rounded bg-brand px-4 py-2 font-semibold text-white">Back to homepage</Link>
      </div>
    </main>
  );
}
