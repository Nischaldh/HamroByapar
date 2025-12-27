import express from "express";
import { authenticate, authorizeBuyer, authorizeSeller } from "../middleware/auth.js";
import {
    placeOrder,
    getBuyersOrder,
    getSellerOrder,
    updateOrderStatus
} from "../controllers/ordersController.js";

const ordersRouter = express.Router();

// ✅ Place Order Route
ordersRouter.post("/place", authenticate, authorizeBuyer, placeOrder);

// ✅ Get Buyer's Orders
ordersRouter.get("/my-orders", authenticate, authorizeBuyer, getBuyersOrder);

// ✅ Get Seller's Orders
ordersRouter.get("/seller-orders", authenticate, authorizeSeller, getSellerOrder);

// ✅ Update Order Status (Seller can update)
ordersRouter.post("/update-status", authenticate, authorizeSeller, updateOrderStatus);

export default ordersRouter;
