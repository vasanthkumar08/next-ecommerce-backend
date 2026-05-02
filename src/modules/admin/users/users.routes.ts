import express, { Router } from "express";
import { protect, authorize } from "../../../middleware/auth.middleware";
import { getUserOrders, listUsers, setUserBlocked, setUserRole } from "./users.controller";

const router: Router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", listUsers);
router.patch("/:id/block", setUserBlocked);
router.patch("/:id/role", setUserRole);
router.get("/:id/orders", getUserOrders);

export default router;
