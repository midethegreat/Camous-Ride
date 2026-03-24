import { Request, Response } from "express";
import { sendWhatsApp } from "../services/twilioService";

const orderResponses = new Map<
  string,
  { status: string; restaurantPhone: string; timestamp: Date }
>();

const sendOrderToRestaurant = async (req: Request, res: Response) => {
  const { restaurantPhone, orderId, items, totalAmount, customerName } =
    req.body;

  if (!restaurantPhone || !orderId || !items) {
    return res.status(400).json({ message: "Missing required order details." });
  }

  try {
    const itemsList = items
      .map((item: any) => `- ${item.name} (x${item.quantity})`)
      .join("\n");
    const body =
      `*New Order from Camous-Ride*\n\n` +
      `Order ID: #${orderId}\n` +
      `Customer: ${customerName || "Valued Customer"}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Total: ₦${totalAmount.toLocaleString()}\n\n` +
      `Please reply with "1" to Accept or "2" to Decline this order.`;

    await sendWhatsApp(restaurantPhone, body);

    res.status(200).json({ message: "Order sent to restaurant via WhatsApp." });
  } catch (error) {
    console.error("[TWILIO] Error sending order to restaurant:", error);
    res.status(500).json({ message: "Failed to send order to restaurant." });
  }
};

const handleTwilioWhatsAppWebhook = async (req: Request, res: Response) => {
  try {
    const Body = req.body.Body as string;
    const From = req.body.From as string;

    console.log(`[TWILIO WHATSAPP] Received message from ${From}: ${Body}`);

    if (!Body || !From) {
      res.set("Content-Type", "text/xml");
      return res.send("<Response></Response>");
    }

    const responseText = Body.trim();
    const restaurantPhone = From.replace("whatsapp:", "");

    // Logic to handle "1" or "2" responses
    if (responseText === "1" || responseText === "2") {
      const status = responseText === "1" ? "accepted" : "declined";

      // In a real app, you'd look up the most recent pending order for this phone
      // and update its status. For now, we just log it.
      console.log(`[TWILIO] Restaurant ${restaurantPhone} ${status} an order.`);
    }

    // Respond with empty TwiML
    res.set("Content-Type", "text/xml");
    res.send("<Response></Response>");
  } catch (error) {
    console.error("[TWILIO WHATSAPP] Error processing webhook:", error);
    res.status(500).send("Internal server error");
  }
};

const getOrderStatus = async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;
  const response = orderResponses.get(orderId);

  if (!response) {
    return res.status(404).json({ message: "Order status not found." });
  }

  res.status(200).json(response);
};

export { sendOrderToRestaurant, handleTwilioWhatsAppWebhook, getOrderStatus };
