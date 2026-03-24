import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

const formatPhoneNumber = (phone: string) => {
  let cleaned = phone.trim();
  // If it starts with 0 and is 11 digits (typical Nigerian number), replace 0 with +234
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "+234" + cleaned.substring(1);
  }
  // Ensure it starts with + if it's a long number without it
  if (!cleaned.startsWith("+") && cleaned.length >= 10) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
};

export const sendSMS = async (to: string, body: string) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to: formattedTo,
    });
    console.log(`[TWILIO SMS] Sent message to ${formattedTo}: ${message.sid}`);
    return message;
  } catch (error: any) {
    console.error(`[TWILIO SMS] Error sending message to ${to}:`, error.message);
    if (error.code) console.error(`[TWILIO ERROR CODE]: ${error.code}`);
    throw error;
  }
};

export const sendWhatsApp = async (to: string, body: string) => {
  try {
    const cleanedTo = formatPhoneNumber(to);
    // WhatsApp numbers in Twilio require 'whatsapp:' prefix
    const formattedTo = cleanedTo.startsWith("whatsapp:") ? cleanedTo : `whatsapp:${cleanedTo}`;
    const formattedFrom = whatsappNumber?.startsWith("whatsapp:")
      ? whatsappNumber
      : `whatsapp:${whatsappNumber}`;

    console.log(`[TWILIO WHATSAPP] Attempting to send to ${formattedTo} from ${formattedFrom}`);

    const message = await client.messages.create({
      body,
      from: formattedFrom,
      to: formattedTo,
    });
    console.log(`[TWILIO WHATSAPP] Sent message to ${formattedTo}: ${message.sid}`);
    return message;
  } catch (error: any) {
    console.error(`[TWILIO WHATSAPP] Error sending message to ${to}:`, error.message);
    if (error.code === 63024) {
      console.error("[TWILIO TIP] Recipient may need to opt-in to the WhatsApp Sandbox first.");
    }
    throw error;
  }
};

export const sendOTP = async (to: string, code: string) => {
  const body = `Your Camous-Ride verification code is: ${code}. It expires in 10 minutes.`;
  return sendSMS(to, body);
};

export const sendRideUpdate = async (to: string, status: string, details: string) => {
  const body = `Camous-Ride: Your ride status has been updated to ${status.toUpperCase()}. ${details}`;
  return sendSMS(to, body);
};
