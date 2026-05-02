import express, { Router } from "express";
import {
  add,
  getAll,
  setDefault,
  remove,
} from "./address.controller";

import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

const router: Router = express.Router();

/**
 * 🔐 All routes protected
 */
router.use(protect);

/**
 * ➕ Add Address
 */
router.post(
  "/",
  // validate(addAddressValidator), // optional future upgrade
  add
);

/**
 * 📥 Get All Addresses
 */
router.get(
  "/",
  // validate(getAddressValidator),
  getAll
);

/**
 * ⭐ Set Default Address
 */
router.put(
  "/:id/default",
  // validate(setDefaultAddressValidator),
  setDefault
);

/**
 * ❌ Delete Address
 */
router.delete(
  "/:id",
  // validate(deleteAddressValidator),
  remove
);

export default router;