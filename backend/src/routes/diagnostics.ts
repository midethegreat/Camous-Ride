import { Router } from "express";
import { sendSMS, sendWhatsApp } from "../services/twilioService";

const router = Router();

router.get("/config", (req, res) => {
  const mailFrom = process.env.MAIL_FROM || "";
  const sendgridKeySet = Boolean(
    process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.length > 10,
  );

  const twilioSidSet = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.length > 5,
  );
  const twilioAuthSet = Boolean(
    process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN.length > 5,
  );
  const twilioPhoneSet = Boolean(process.env.TWILIO_PHONE_NUMBER);
  const twilioWhatsAppSet = Boolean(process.env.TWILIO_WHATSAPP_NUMBER);

  res.json({
    email: {
      sendgridApiKeyLoaded: sendgridKeySet,
      mailFromConfigured: Boolean(mailFrom),
      mailFromDomain: mailFrom.includes("@") ? mailFrom.split("@")[1] : null,
    },
    twilio: {
      accountSidLoaded: twilioSidSet,
      authTokenLoaded: twilioAuthSet,
      phoneNumberConfigured: twilioPhoneSet,
      whatsAppNumberConfigured: twilioWhatsAppSet,
    },
    env: process.env.NODE_ENV || "development",
  });
});

router.post("/test-twilio", async (req, res) => {
  const { to, type } = req.body;

  if (!to || !type) {
    return res
      .status(400)
      .json({
        message: "Recipient number (to) and type (sms/whatsapp) are required.",
      });
  }

  try {
    let result;
    const testBody = "Test message from Camous-Ride diagnostics endpoint.";

    if (type === "sms") {
      result = await sendSMS(to, testBody);
    } else if (type === "whatsapp") {
      result = await sendWhatsApp(to, testBody);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid type. Use 'sms' or 'whatsapp'." });
    }

    res.json({ success: true, messageSid: result.sid });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
