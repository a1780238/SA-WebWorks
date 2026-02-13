import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { tenantConfig } from "@/config/tenant";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const jobType = url.searchParams.get("job_type");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const supabase = createSupabaseAdminClient();
  let query = supabase.from("leads").select("*").eq("tenant_key", tenantConfig.tenantKey).order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (jobType) query = query.eq("job_type", jobType);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  const { data, error } = await query.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (url.searchParams.get("format") === "csv") {
    const headers = ["id", "created_at", "name", "phone", "suburb", "job_type", "urgency", "status", "notes"];
    const rows = (data ?? []).map((row) => headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
  }

  return NextResponse.json({ leads: data ?? [] });
}
