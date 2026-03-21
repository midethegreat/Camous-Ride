import { Router } from "express";
import { getChatMessages, sendChatMessage } from "../controllers/chatController";

const router = Router();

router.get("/", getChatMessages);
router.post("/", sendChatMessage);

export default router;
