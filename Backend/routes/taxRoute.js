import express from 'express';
import { payTax, getTaxStatus, getDueTaxation } from '../controllers/taxationController.js';
import { authenticate, authorizeSeller } from "../middleware/auth.js";

const taxRouter = express.Router();

// Route to pay tax
taxRouter.post('/pay', authenticate, authorizeSeller, payTax);

// Route to get taxation status for a seller
taxRouter.get('/status', authenticate, authorizeSeller, getTaxStatus);
// taxRouter.get('/status',  getTaxStatus);

// Route to get due taxation (pending taxes)
taxRouter.get('/due', authenticate, authorizeSeller, getDueTaxation);

export default taxRouter;
