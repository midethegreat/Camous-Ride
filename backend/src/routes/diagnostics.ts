import { Router } from "express";

const router = Router();

router.get("/config", (req, res) => {
  const mailFrom = process.env.MAIL_FROM || "";
  const sendgridKeySet = Boolean(
    process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.length > 10,
  );

  res.json({
    email: {
      sendgridApiKeyLoaded: sendgridKeySet,
      mailFromConfigured: Boolean(mailFrom),
      mailFromDomain: mailFrom.includes("@") ? mailFrom.split("@")[1] : null,
    },
    twilio: {
      accountSidLoaded: false,
      authTokenLoaded: false,
      phoneNumberConfigured: false,
      whatsAppNumberConfigured: false,
    },
    env: process.env.NODE_ENV || "development",
  });
});

// Twilio test endpoint removed - service deleted

export default router;
