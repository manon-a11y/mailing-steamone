const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_FIELDS = [
  ["selectedProduct", "Selected product"],
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["hotelName", "Hotel name"],
  ["email", "Email"],
  ["deliveryCountry", "Delivery country"],
  ["preferredDateTime", "Preferred date/time"],
  ["message", "Message"],
];

export class LeadRequestError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "LeadRequestError";
    this.statusCode = statusCode;
  }
}

export function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      throw new LeadRequestError(`Invalid JSON request body: ${error.message}`);
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

export function buildEmailHtml({ title, payload }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;padding:28px;background:#f8f5f0;color:#1f1b18;">
      <h1 style="font-family:Georgia,serif;font-weight:500;margin:0 0 16px;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 24px;color:#5f5750;">A new SteamOne hotel landing page form was submitted.</p>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5ded6;">
        ${fieldRows(EMAIL_FIELDS, payload)}
      </table>
    </div>
  `;
}

export function validateLeadRequest(req, payload, config) {
  if (req.method !== "POST") {
    throw new LeadRequestError("Only POST requests are allowed.", 405);
  }

  const missingFields = config.requiredFields.filter((field) => !String(payload[field] || "").trim());

  if (missingFields.length > 0) {
    throw new LeadRequestError(
      `Please complete all required fields. Missing: ${missingFields.join(", ")}.`,
    );
  }

  if (!EMAIL_PATTERN.test(String(payload.email || ""))) {
    throw new LeadRequestError("Please enter a valid email address.");
  }

  if (config.allowedValues) {
    const invalidField = Object.entries(config.allowedValues).find(
      ([field, allowed]) => !allowed.includes(String(payload[field] || "")),
    )?.[0];

    if (invalidField) {
      throw new LeadRequestError(`Please select a valid value for ${invalidField}.`);
    }
  }
}

export function getEnvironmentStatus() {
  return {
    NOTIFICATION_EMAIL: Boolean(process.env.NOTIFICATION_EMAIL),
    FROM_EMAIL: Boolean(process.env.FROM_EMAIL),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
  };
}

export function validateEmailEnvironment(environmentStatus) {
  const missingVariables = Object.entries(environmentStatus)
    .filter(([, exists]) => !exists)
    .map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new LeadRequestError(
      `Email is not configured. Missing environment variables: ${missingVariables.join(", ")}.`,
      500,
    );
  }
}

export function serializeResendError(error) {
  return {
    name: error?.name || "resend_error",
    message: error?.message || "Resend could not send the email.",
    statusCode: Number.isInteger(error?.statusCode) ? error.statusCode : null,
  };
}

export function getErrorStatus(error, fallback = 500) {
  const statusCode = Number(error?.statusCode);

  return statusCode >= 400 && statusCode <= 599 ? statusCode : fallback;
}

export function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error || "Unknown error");
}
