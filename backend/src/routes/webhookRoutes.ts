import { Router } from "express";
import { handleFlutterwaveWebhook } from "../controllers/webhookController";
import { 
  handleTwilioWhatsAppWebhook, 
  sendOrderToRestaurant,
  getOrderStatus 
} from "../controllers/twilioController";

const router = Router();

router.post("/flutterwave", handleFlutterwaveWebhook);
router.post("/twilio/whatsapp", handleTwilioWhatsAppWebhook);
router.post("/twilio/whatsapp/order", sendOrderToRestaurant);
router.get("/twilio/whatsapp/order-status/:orderId", getOrderStatus);

export default router;
