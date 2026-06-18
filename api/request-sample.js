import { handleLeadRequest } from "./shared.js";

const fields = [
  ["selectedProduct", "Selected product"],
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["hotelName", "Hotel name"],
  ["email", "Email"],
  ["deliveryCountry", "Delivery country"],
  ["message", "Message"],
];

export default async function handler(req, res) {
  await handleLeadRequest(req, res, {
    title: "SteamOne sample request",
    logLabel: "request-sample-email-error",
    fields,
    requiredFields: [
      "selectedProduct",
      "firstName",
      "lastName",
      "hotelName",
      "email",
      "deliveryCountry",
    ],
    allowedValues: {
      selectedProduct: ["PRO400", "PRO500"],
    },
    subject: (payload) =>
      `SteamOne ${payload.selectedProduct} sample request - ${payload.hotelName}`,
  });
}
