import sgMail from "@sendgrid/mail";

console.log("--- Mailer.ts loaded (SendGrid) ---");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const MAIL_FROM = process.env.MAIL_FROM || "";
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || "";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "";

if (!SENDGRID_API_KEY) {
  console.warn(
    "SENDGRID_API_KEY is not set. Emails will fail in production. Set it in backend/.env",
  );
}

sgMail.setApiKey(SENDGRID_API_KEY);

function parseFrom(from: string) {
  const m = from.match(/^\s*(.*)<\s*([^>]+)\s*>\s*$/);
  if (m) {
    const name = m[1].trim().replace(/"$/, "").replace(/^"/, "");
    const email = m[2].trim();
    return { email, name };
  }
  return { email: from.trim(), name: "" };
}

export const sendOtpEmail = async (to: string, otp: string) => {
  const parsed = parseFrom(MAIL_FROM);
  const fromEmail = MAIL_FROM_EMAIL || parsed.email;
  const fromName = MAIL_FROM_NAME || parsed.name || "COLISDAV";
  if (!fromEmail || !fromEmail.includes("@")) {
    const hasKey = Boolean(SENDGRID_API_KEY);
    if (process.env.NODE_ENV !== "production" && !hasKey) {
      console.warn(
        "Missing or invalid MAIL_FROM. Skipping email in development.",
      );
      return;
    }
    throw new Error("Invalid MAIL_FROM configuration");
  }
  const msg = {
    to,
    from: { email: fromEmail, name: fromName },
    subject: "Your COLISDAV Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to COLISDAV!</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <br>
        <p>Best,</p>
        <p>The COLISDAV Team</p>
      </div>
    `,
  } as Parameters<typeof sgMail.send>[0];

  try {
    await sgMail.send(msg);
    console.log("OTP email sent via SendGrid to:", to);
  } catch (error: any) {
    const errMsg =
      (error?.response &&
        error.response.body &&
        JSON.stringify(error.response.body)) ||
      error?.message ||
      String(error);
    console.error("SendGrid error:", errMsg);
    const hasKey = Boolean(SENDGRID_API_KEY);
    if (process.env.NODE_ENV !== "production" && !hasKey) {
      console.warn(
        "Development fallback: SENDGRID_API_KEY missing. Skipping email delivery.",
      );
      return;
    }
    throw new Error("Failed to send OTP email.");
  }
};
