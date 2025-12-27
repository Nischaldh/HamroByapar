import express from "express";
import { authenticate, authorizeSeller, authorizeBuyer } from "../middleware/auth.js";
import {
    addDeliveryInfo,
    getDeliveryInfo
} from "../controllers/deliveryController.js";

const deliveryRouter = express.Router();

// ✅ Add Delivery Information
deliveryRouter.post("/add", authenticate, authorizeBuyer, addDeliveryInfo);

// ✅ Get Delivery Information for a specific order (Seller can view)
deliveryRouter.get("/:orderId", authenticate, authorizeSeller, getDeliveryInfo);

export default deliveryRouter;
