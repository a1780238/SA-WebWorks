import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validators";
import { tenantConfig } from "@/config/tenant";
import { verifyTurnstile } from "@/lib/turnstile";
import { notifyOwner } from "@/lib/notify";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const input = parsed.data;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${input.phone}`)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const turnstileOk = await verifyTurnstile(input.turnstileToken, ip);
    if (!turnstileOk) return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const duplicateCutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: duplicate } = await supabase
      .from("leads")
      .select("id")
      .eq("tenant_key", tenantConfig.tenantKey)
      .eq("phone", input.phone)
      .eq("suburb", input.suburb)
      .eq("job_type", input.job_type)
      .gte("created_at", duplicateCutoff)
      .maybeSingle();

    if (duplicate) return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });

    const { data, error } = await supabase
      .from("leads")
      .insert({
        tenant_key: tenantConfig.tenantKey,
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        suburb: input.suburb,
        job_type: input.job_type,
        urgency: input.urgency,
        description: input.description || null,
        preferred_contact_window: input.preferred_contact_window || null,
        source: input.source,
        status: "new",
        deposit_status: "none",
        deposit_amount_cents: 0,
        utm_source: input.utm_source || null,
        utm_medium: input.utm_medium || null,
        utm_campaign: input.utm_campaign || null,
        utm_term: input.utm_term || null,
        utm_content: input.utm_content || null
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await notifyOwner(data);
    trackServerEvent("lead_submit", { tenant: tenantConfig.tenantKey, leadId: data.id });

    return NextResponse.json({ ok: true, leadId: data.id });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
