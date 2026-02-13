"use client";

import Link from "next/link";
import { tenantConfig } from "@/config/tenant";
import { trackClientEvent } from "@/components/tracking";

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white p-2 shadow md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <a
          href={`tel:${tenantConfig.phone}`}
          className="flex-1 rounded bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white"
          onClick={() => trackClientEvent("call_click")}
        >
          Call
        </a>
        <Link href="#quote" className="flex-1 rounded bg-brand px-3 py-2 text-center text-sm font-semibold text-white">
          Get Quote
        </Link>
      </div>
    </div>
  );
}
