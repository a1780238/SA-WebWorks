"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  suburb: string;
  job_type: string;
  urgency: string;
  status: string;
  notes: string | null;
};

export function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [suburb, setSuburb] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (service) p.set("job_type", service);
    if (suburb) p.set("suburb", suburb);
    if (from) p.set("from", `${from}T00:00:00.000Z`);
    if (to) p.set("to", `${to}T23:59:59.999Z`);
    return p.toString();
  }, [status, service, suburb, from, to]);

  async function load() {
    const res = await fetch(`/api/admin/leads?${qs}`);
    const data = await res.json();
    setLeads(data.leads ?? []);
  }

  async function updateLead(id: string, nextStatus: string, notes: string) {
    await fetch(`/api/admin/lead/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, notes })
    });
    await load();
  }

  useEffect(() => { void load(); }, [qs]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-6">
        <input className="rounded border p-2" placeholder="Status" value={status} onChange={(e)=>setStatus(e.target.value)} />
        <input className="rounded border p-2" placeholder="Service" value={service} onChange={(e)=>setService(e.target.value)} />
        <input className="rounded border p-2" placeholder="Suburb" value={suburb} onChange={(e)=>setSuburb(e.target.value)} />
        <input className="rounded border p-2" type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
        <input className="rounded border p-2" type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
        <a className="rounded border bg-white p-2 text-center" href={`/api/admin/leads?${qs}&format=csv`}>Export CSV</a>
      </div>

      <div className="overflow-x-auto rounded border bg-white p-3">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Name</th><th>Phone</th><th>Suburb</th><th>Service</th><th>Status</th><th>Notes</th><th>Save</th></tr></thead>
          <tbody>
            {leads.map((lead) => (
              <Row key={lead.id} lead={lead} onSave={updateLead} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ lead, onSave }: { lead: Lead; onSave: (id: string, status: string, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");

  return (
    <tr className="border-t align-top">
      <td>{lead.name}</td>
      <td>{lead.phone}</td>
      <td>{lead.suburb}</td>
      <td>{lead.job_type}</td>
      <td><input className="rounded border p-1" value={status} onChange={(e)=>setStatus(e.target.value)} /></td>
      <td><textarea className="w-56 rounded border p-1" rows={2} value={notes} onChange={(e)=>setNotes(e.target.value)} /></td>
      <td><button className="rounded bg-brand px-2 py-1 text-white" onClick={()=>onSave(lead.id,status,notes)}>Save</button></td>
    </tr>
  );
}
