import pool from "../config/postgres.js";

// Function to get the current wallet balance of the seller
export const getWalletBalance = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const query = 'SELECT wallet FROM sellers WHERE id = $1';
        const result = await pool.query(query, [seller_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        return res.json({ success: true, wallet: result.rows[0].wallet });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return res.status(500).json({ success: false, message: 'Error fetching wallet balance' });
    }
};

// Function to withdraw amount from the seller's wallet
export const withdrawFromWallet = async (req, res) => {
    try {
        const seller_id = req.user.id; 
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
        }

        const walletBalance = await getWalletBalance(seller_id);
        if (walletBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const newBalance = walletBalance - amount;
        const updateQuery = 'UPDATE sellers SET wallet = $1 WHERE id = $2';
        await pool.query(updateQuery, [newBalance, seller_id]);

        const transactionQuery = `
            INSERT INTO wallet_transactions (seller_id, amount, transaction_type, balance)
            VALUES ($1, $2, 'debit', $3)
        `;
        await pool.query(transactionQuery, [seller_id, amount, newBalance]);

        return res.json({ success: true, newBalance });
    } catch (error) {
        console.error('Error withdrawing from wallet:', error);
        return res.status(500).json({ success: false, message: 'Error withdrawing from wallet' });
    }
};

// Function to pay tax from the seller's wallet
export const payTaxFromWallet = async (req, res) => {
    try {
        const seller_id = req.user.id; 
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }

        const taxQuery = `
            SELECT tax_amount FROM taxation
            WHERE seller_id = $1 AND order_id = $2
        `;
        const result = await pool.query(taxQuery, [seller_id, order_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Tax record not found' });
        }
        const taxAmount = result.rows[0].tax_amount;

        const walletBalance = await getWalletBalance(seller_id);
        if (walletBalance < taxAmount) {
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance to pay tax' });
        }

        const newBalance = await withdrawFromWallet(seller_id, taxAmount);

        return res.json({ success: true, newBalance, taxAmount });
    } catch (error) {
        console.error('Error paying tax from wallet:', error);
        return res.status(500).json({ success: false, message: 'Error paying tax from wallet' });
    }
};

// Function to calculate and track tax for a seller after an order is completed
export const calculateAndTrackTax = async (req, res) => {
    try {
        const seller_id = req.user.id; 
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }

        const orderQuery = `
            SELECT oi.seller_id, oi.price, oi.quantity
            FROM order_items oi
            WHERE oi.order_id = $1
        `;
        const orderItemsResult = await pool.query(orderQuery, [order_id]);

        if (orderItemsResult.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'No order items found' });
        }

        const taxRate = 0.13;
        let sellerTax = {};
        orderItemsResult.rows.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const taxAmount = itemTotal * taxRate;

            if (sellerTax[item.seller_id]) {
                sellerTax[item.seller_id] += taxAmount;
            } else {
                sellerTax[item.seller_id] = taxAmount;
            }
        });

        for (const seller_id in sellerTax) {
            const taxAmount = sellerTax[seller_id];
            const insertTaxQuery = `
                INSERT INTO taxation (seller_id, order_id, tax_amount)
                VALUES ($1, $2, $3)
            `;
            await pool.query(insertTaxQuery, [seller_id, order_id, taxAmount]);
        }

        return res.json({ success: true, sellerTax });
    } catch (error) {
        console.error('Error calculating and tracking tax:', error);
        return res.status(500).json({ success: false, message: 'Error calculating and tracking tax' });
    }
};

// Controller to handle order completion and tax payment
export const handleOrderCompletion = async (req, res) => {
    try {
        const seller_id = req.user.id; 
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }

        await pool.query('BEGIN'); 

        const updateOrderStatusQuery = `
            UPDATE orders SET status = 'Delivered' WHERE id = $1 AND status != 'Delivered'
        `;
        await pool.query(updateOrderStatusQuery, [order_id]);

        const sellerTax = await calculateAndTrackTax(req, res);

        for (const seller_id in sellerTax.sellerTax) {
            const taxAmount = sellerTax.sellerTax[seller_id];
            await payTaxFromWallet(req, res);
            console.log(`Tax paid by Seller ${seller_id}: ${taxAmount}.`);
        }

        await pool.query('COMMIT'); 

        return res.json({ success: true, message: 'Order completed and tax paid' });
    } catch (error) {
        await pool.query('ROLLBACK'); 
        console.error('Error handling order completion:', error);
        return res.status(500).json({ success: false, message: 'Error completing order' });
    }
};
