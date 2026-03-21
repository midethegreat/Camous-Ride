import { Router } from "express";
import { getVouchers, createVoucher } from "../controllers/voucherController";

const router = Router();

router.get("/", getVouchers);
router.post("/", createVoucher);

export default router;
