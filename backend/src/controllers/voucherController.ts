import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Voucher } from "../entities/Voucher";

const voucherRepository = AppDataSource.getRepository(Voucher);

export const getVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await voucherRepository.find();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vouchers" });
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  const { code, discount, description, expiresAt } = req.body;
  try {
    const voucher = new Voucher();
    voucher.code = code;
    voucher.discount = discount;
    voucher.description = description;
    voucher.expiresAt = new Date(expiresAt);
    await voucherRepository.save(voucher);
    res.status(201).json(voucher);
  } catch (error) {
    res.status(500).json({ message: "Failed to create voucher" });
  }
};
