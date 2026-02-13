import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validators";
import { tenantConfig } from "@/config/tenant";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendLeadConfirmation, sendOwnerNotification } from "@/lib/notify";
import { sanitizeText } from "@/lib/sanitize";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const input = parsed.data;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${input.phone}`)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const turnstileOk = await verifyTurnstile(input.turnstileToken, ip);
    if (!turnstileOk) return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const duplicateCutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: duplicate } = await supabase
      .from("leads")
      .select("id")
      .eq("tenant_key", tenantConfig.tenantKey)
      .eq("phone", sanitizeText(input.phone))
      .eq("suburb", sanitizeText(input.suburb))
      .eq("job_type", sanitizeText(input.job_type))
      .gte("created_at", duplicateCutoff)
      .maybeSingle();

    if (duplicate) return NextResponse.json({ ok: true, duplicate: true, leadId: duplicate.id });

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        tenant_key: tenantConfig.tenantKey,
        name: sanitizeText(input.name),
        phone: sanitizeText(input.phone),
        email: sanitizeText(input.email) || null,
        suburb: sanitizeText(input.suburb),
        job_type: sanitizeText(input.job_type),
        urgency: input.urgency,
        description: sanitizeText(input.description) || null,
        preferred_contact_window: input.preferred_contact_window || null,
        source: input.source,
        page_source: sanitizeText(input.page_source),
        status: "new",
        deposit_status: "none",
        deposit_amount_cents: 0,
        utm_source: sanitizeText(input.utm_source) || null,
        utm_medium: sanitizeText(input.utm_medium) || null,
        utm_campaign: sanitizeText(input.utm_campaign) || null,
        utm_term: sanitizeText(input.utm_term) || null,
        utm_content: sanitizeText(input.utm_content) || null
      })
      .select("*")
      .single();

    if (error || !lead) return NextResponse.json({ error: error?.message ?? "Unable to create lead" }, { status: 500 });

    const requestKey = req.headers.get("x-idempotency-key") || `lead-${lead.id}`;

    const ownerAttempt = await supabase.from("notification_attempts").insert({
      unique_key: `${requestKey}:owner`,
      lead_id: lead.id,
      channel: tenantConfig.ownerSms ? "email+sms" : "email",
      recipient: tenantConfig.ownerEmail
    });
    if (!ownerAttempt.error) await sendOwnerNotification(lead);

    if (lead.email || lead.phone) {
      const leadAttempt = await supabase.from("notification_attempts").insert({
        unique_key: `${requestKey}:lead`,
        lead_id: lead.id,
        channel: lead.phone ? "email+sms" : "email",
        recipient: String(lead.email || lead.phone)
      });
      if (!leadAttempt.error) await sendLeadConfirmation(lead);
    }

    await supabase.from("analytics_events").insert({
      tenant_key: tenantConfig.tenantKey,
      lead_id: lead.id,
      event_name: "quote_success",
      payload: { source: input.source, page_source: input.page_source }
    });

    trackServerEvent("quote_success", { tenant: tenantConfig.tenantKey, leadId: lead.id });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
