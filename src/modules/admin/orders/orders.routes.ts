import express, { Router } from "express";
import { protect, authorize } from "../../../middleware/auth.middleware.js";
import {
  deleteDeliveredOrder,
  exportOrdersCsv,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "./orders.controller.js";

const router: Router = express.Router();

router.use(protect, authorize("admin", "manager"));
router.get("/", listOrders);
router.get("/export.csv", exportOrdersCsv);
router.get("/:id", getOrder);
router.patch("/:id/status", authorize("admin"), updateOrderStatus);
router.delete("/:id", authorize("admin"), deleteDeliveredOrder);

export default router;
