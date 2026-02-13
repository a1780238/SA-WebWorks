import { Resend } from "resend";
import { tenantConfig } from "@/config/tenant";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOwnerNotification(lead: Record<string, unknown>) {
  const subject = `New Lead: ${(lead.job_type as string) ?? "Unknown"} | Call in 5 minutes`;
  const html = `<h2>New lead received</h2><p>Call this lead in 5 minutes.</p><pre>${JSON.stringify(lead, null, 2)}</pre>`;

  if (resend) {
    await resend.emails.send({
      from: process.env.MAIL_FROM ?? "SA WebWorks <noreply@sawebworks.com.au>",
      to: tenantConfig.ownerEmail,
      subject,
      html
    });
  }

  if (tenantConfig.ownerSms) {
    console.log("[sms:owner:optional]", tenantConfig.ownerSms, lead);
  }
}

export async function sendLeadConfirmation(lead: Record<string, unknown>) {
  const email = String(lead.email ?? "").trim();
  const phone = String(lead.phone ?? "").trim();

  if (email && resend) {
    await resend.emails.send({
      from: process.env.MAIL_FROM ?? "SA WebWorks <noreply@sawebworks.com.au>",
      to: email,
      subject: `We received your quote request`,
      html: `<p>Thanks for your enquiry. We'll contact you shortly.</p><p>Reference: ${String(lead.id ?? "")}</p>`
    });
  }

  if (phone) {
    console.log("[sms:lead:optional]", phone, "Thanks, we received your quote request.");
  }
}
