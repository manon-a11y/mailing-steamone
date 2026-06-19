import { Resend } from "resend";
import {
  buildEmailHtml,
  getEnvironmentStatus,
  getErrorMessage,
  getErrorStatus,
  parseBody,
  serializeResendError,
  validateEmailEnvironment,
  validateLeadRequest,
} from "./shared.js";

const routeLabel = "[api/book-meeting]";

export default async function handler(req, res) {
  console.info(`${routeLabel} API route called`);
  const environmentStatus = getEnvironmentStatus();
  console.info(`${routeLabel} env vars exist`, environmentStatus);

  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  let resendSendStarted = false;

  try {
    const payload = parseBody(req);

    validateLeadRequest(req, payload, {
      requiredFields: ["firstName", "lastName", "hotelName", "email", "preferredDateTime"],
    });
    validateEmailEnvironment(environmentStatus);

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.info(`${routeLabel} Resend send started`);
    resendSendStarted = true;
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.NOTIFICATION_EMAIL,
      replyTo: payload.email,
      subject: `SteamOne meeting request - ${payload.hotelName}`,
      html: buildEmailHtml({
        title: "SteamOne meeting request",
        payload,
      }),
    });

    if (error) {
      console.error(`${routeLabel} Resend error`, error);
      const resendError = serializeResendError(error);
      res.status(getErrorStatus(error, 502)).json({
        success: false,
        error: resendError.message,
        resendError,
      });
      return;
    }

    if (!data?.id) {
      const missingIdError = {
        name: "missing_resend_email_id",
        message: "Resend did not return a successful email ID.",
        statusCode: 502,
      };
      console.error(`${routeLabel} Resend error`, missingIdError);
      res.status(502).json({
        success: false,
        error: missingIdError.message,
        resendError: missingIdError,
      });
      return;
    }

    console.info(`${routeLabel} Resend success id`, data.id);
    res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    if (resendSendStarted) {
      console.error(`${routeLabel} Resend error`, error);
    } else {
      console.error(`${routeLabel} error before calling Resend`, error);
    }

    res.status(getErrorStatus(error)).json({
      success: false,
      error: getErrorMessage(error),
    });
  }
}
