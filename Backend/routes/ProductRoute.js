import express from "express";
import { listSellerProducts, addProduct, removeProduct, listAllProducts } from "../controllers/productsController.js";
import upload from "../middleware/multer.js";
import { authenticate, authorizeSeller } from "../middleware/auth.js";

const productRouter = express.Router();

// ✅ Protected Routes (Only Sellers Can Access)
productRouter.post("/add", authenticate, authorizeSeller, upload.array("images", 4), addProduct);
productRouter.post("/remove", authenticate, authorizeSeller, removeProduct);

productRouter.get("/list", authenticate, authorizeSeller, listSellerProducts);

// ✅ Public Route (Anyone Can Access)
productRouter.get("/list/all", listAllProducts);

export default productRouter;
