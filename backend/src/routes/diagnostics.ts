import { Router } from "express";

const router = Router();

router.get("/email", (req, res) => {
  const from = process.env.MAIL_FROM || "";
  const keySet = Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.length > 10);
  res.json({
    sendgridApiKeyLoaded: keySet,
    mailFromConfigured: Boolean(from),
    mailFromDomain: from.includes("@") ? from.split("@")[1] : null,
    env: process.env.NODE_ENV || "development",
  });
});

export default router;
