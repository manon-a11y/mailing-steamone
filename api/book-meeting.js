import { handleLeadRequest } from "./shared.js";

const fields = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["hotelName", "Hotel name"],
  ["email", "Email"],
  ["preferredDateTime", "Preferred date/time"],
  ["message", "Message"],
];

export default async function handler(req, res) {
  await handleLeadRequest(req, res, {
    title: "SteamOne meeting request",
    logLabel: "book-meeting-email-error",
    fields,
    requiredFields: ["firstName", "lastName", "hotelName", "email", "preferredDateTime"],
    subject: (payload) => `SteamOne meeting request - ${payload.hotelName}`,
  });
}
