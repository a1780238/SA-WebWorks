import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { tenantConfig } from "@/config/tenant";
import { requireApiAdmin } from "@/lib/admin-guard";
import { leadStatusSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireApiAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  const statusCheck = leadStatusSchema.safeParse(body.status);
  if (!statusCheck.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status: statusCheck.data, notes: sanitizeText(body.notes) || null })
    .eq("tenant_key", tenantConfig.tenantKey)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
