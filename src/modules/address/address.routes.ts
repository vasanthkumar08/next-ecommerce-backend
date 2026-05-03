import express, { Router } from "express";
import {
  add,
  getAll,
  update,
  setDefault,
  remove,
} from "./address.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

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

router.put("/:id", update);

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
