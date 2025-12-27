import express from "express"
import adminAuth from "../middleware/adminAuth.js";
import { adminLogin, getAllOrdersWithTax, getAllSellersWithTax } from "../controllers/adminController.js";


const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);

adminRouter.get('/users', adminAuth, getAllSellersWithTax);
adminRouter.get('/tax-summary',adminAuth, getAllOrdersWithTax);

export default adminRouter;