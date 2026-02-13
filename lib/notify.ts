import { Resend } from "resend";
import { tenantConfig } from "@/config/tenant";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function notifyOwner(lead: Record<string, unknown>) {
  const subject = `New Lead: ${(lead.job_type as string) ?? "Unknown"} | Call in 5 minutes`;
  const html = `<h2>New lead received</h2><pre>${JSON.stringify(lead, null, 2)}</pre>`;

  if (resend) {
    await resend.emails.send({
      from: process.env.MAIL_FROM ?? "SA WebWorks <noreply@sawebworks.com.au>",
      to: tenantConfig.ownerEmail,
      subject,
      html
    });
  }

  if (tenantConfig.ownerSms) {
    console.log("[sms:optional] send to", tenantConfig.ownerSms, lead);
  }

  console.log("[notification] owner email attempted", { to: tenantConfig.ownerEmail, subject });
}
