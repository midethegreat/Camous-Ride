import { Router } from "express";
import { initializeCryptoDeposit, verifyCryptoDeposit } from "../controllers/cryptoController";

const router = Router();

router.post("/initialize", initializeCryptoDeposit);
router.post("/verify", verifyCryptoDeposit);

export default router;
