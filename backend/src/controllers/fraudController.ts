import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { FraudLog } from "../entities/FraudLog";
import { User } from "../entities/User";

const fraudLogRepo = AppDataSource.getRepository(FraudLog);
const userRepo = AppDataSource.getRepository(User);

export const getFraudLogs = async (req: Request, res: Response) => {
  try {
    const logs = await fraudLogRepo.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
    return res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching fraud logs:", error);
    return res.status(500).json({ message: "Failed to fetch fraud logs." });
  }
};

export const resolveFraudFlag = async (req: Request, res: Response) => {
  const { userId, status } = req.body; // status: "active" | "frozen" | "under_review"

  if (!userId || !status) {
    return res.status(400).json({ message: "UserId and status are required." });
  }

  try {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.accountStatus = status;
    if (status === "active") {
      user.isFlagged = false;
    }
    
    await userRepo.save(user);
    return res.status(200).json({ message: `User account status updated to ${status}.` });
  } catch (error) {
    console.error("Error resolving fraud flag:", error);
    return res.status(500).json({ message: "Failed to resolve fraud flag." });
  }
};
