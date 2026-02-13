import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { tenantConfig } from "@/config/tenant";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status: body.status, notes: body.notes })
    .eq("tenant_key", tenantConfig.tenantKey)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
