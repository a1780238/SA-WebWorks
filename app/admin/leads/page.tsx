import { requireAdminSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { tenantConfig } from "@/config/tenant";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdminSession();
  const supabase = createSupabaseAdminClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id,created_at,name,phone,suburb,job_type,urgency,status,notes")
    .eq("tenant_key", tenantConfig.tenantKey)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="container-app py-8">
      <h1 className="mb-4 text-3xl font-bold">Leads Dashboard</h1>
      <div className="overflow-x-auto rounded border bg-white p-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Name</th><th>Phone</th><th>Suburb</th><th>Job Type</th><th>Urgency</th><th>Status</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-t">
                <td>{lead.name}</td><td>{lead.phone}</td><td>{lead.suburb}</td><td>{lead.job_type}</td><td>{lead.urgency}</td><td>{lead.status}</td><td>{new Date(lead.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-slate-600">Use API endpoints for status updates, notes edits, and CSV export automation.</p>
    </main>
  );
}
