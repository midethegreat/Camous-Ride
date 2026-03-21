import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ChatMessage } from "../entities/ChatMessage";

const chatRepository = AppDataSource.getRepository(ChatMessage);

export const getChatMessages = async (req: Request, res: Response) => {
  const { userId, driverId } = req.query;
  try {
    const messages = await chatRepository.find({
      where: {
        user: { id: userId as string },
        driver: { id: driverId as string },
      },
      order: { createdAt: "ASC" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
};

export const sendChatMessage = async (req: Request, res: Response) => {
  const { userId, driverId, text, sender } = req.body;
  try {
    const message = new ChatMessage();
    message.user = { id: userId } as any;
    message.driver = { id: driverId } as any;
    message.text = text;
    message.sender = sender;
    await chatRepository.save(message);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
};
