import express from "express";
import { authenticate, authorizeBuyer } from "../middleware/auth.js";
import { addToCart, removeFromCart, getCartItems, updateCartQuantity } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/add", authenticate, authorizeBuyer, addToCart);

cartRouter.post("/remove", authenticate, authorizeBuyer, removeFromCart);
cartRouter.get("/list", authenticate, authorizeBuyer, getCartItems);
cartRouter.post("/update", authenticate, authorizeBuyer, updateCartQuantity);


export default cartRouter;
