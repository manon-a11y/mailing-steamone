import { Resend } from "resend";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fieldRows(fields, payload) {
  return fields
    .map(
      ([name, label]) => `
        <tr>
          <td style="padding:8px 14px;color:#7a6a5d;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:8px 14px;color:#1f1b18;">${escapeHtml(payload[name] || "-")}</td>
        </tr>
      `,
    )
    .join("");
}

function buildEmailHtml({ title, fields, payload }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;padding:28px;background:#f8f5f0;color:#1f1b18;">
      <h1 style="font-family:Georgia,serif;font-weight:500;margin:0 0 16px;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 24px;color:#5f5750;">A new SteamOne hotel landing page form was submitted.</p>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5ded6;">
        ${fieldRows(fields, payload)}
      </table>
    </div>
  `;
}

export async function handleLeadRequest(req, res, config) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests are allowed." });
    return;
  }

  const payload = parseBody(req);
  const missingFields = config.requiredFields.filter((field) => !String(payload[field] || "").trim());

  if (missingFields.length > 0) {
    res.status(400).json({ error: "Please complete all required fields." });
    return;
  }

  if (!EMAIL_PATTERN.test(String(payload.email || ""))) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  if (config.allowedValues) {
    const hasInvalidValue = Object.entries(config.allowedValues).some(
      ([field, allowed]) => !allowed.includes(String(payload[field] || "")),
    );

    if (hasInvalidValue) {
      res.status(400).json({ error: "Please select a valid product." });
      return;
    }
  }

  const { NOTIFICATION_EMAIL, FROM_EMAIL, RESEND_API_KEY } = process.env;

  // TODO: Configure these three environment variables in Vercel before publishing
  // so form submissions can be delivered through Resend.
  if (!NOTIFICATION_EMAIL || !FROM_EMAIL || !RESEND_API_KEY) {
    res.status(500).json({
      error: "Email is not configured yet. Add NOTIFICATION_EMAIL, FROM_EMAIL, and RESEND_API_KEY.",
    });
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      replyTo: payload.email,
      subject: config.subject(payload),
      html: buildEmailHtml({ title: config.title, fields: config.fields, payload }),
    });

    // Analytics hook: add server-side form conversion tracking here if needed.
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(config.logLabel, error);
    res.status(500).json({ error: "The request could not be sent. Please try again." });
  }
}
