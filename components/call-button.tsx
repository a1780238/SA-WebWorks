"use client";

import { trackClientEvent } from "@/components/tracking";

export function CallButton({ phone, className }: { phone: string; className?: string }) {
  return (
    <a href={`tel:${phone}`} className={className} onClick={() => trackClientEvent("call_click")}>
      Call Now
    </a>
  );
}
