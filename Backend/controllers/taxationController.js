import pool from "../config/postgres.js";

// Calculate 13% tax when an order is marked as 'Delivered'
export const calculateTax = async (order_id) => {
    try {
        console.log("Calculating tax for order:", order_id); // Debugging log
        
        const taxRate = 0.13; // 13% tax rate

        const orderQuery = `
            SELECT oi.seller_id, SUM(oi.price * oi.quantity) AS total_amount
            FROM order_items oi
            WHERE oi.order_id = $1
            GROUP BY oi.seller_id;
        `;
        const orderResult = await pool.query(orderQuery, [order_id]);

        if (orderResult.rowCount === 0) {
            console.error("No order items found for order:", order_id);
            throw new Error('No order items found.');
        }

        for (const row of orderResult.rows) {
            const taxAmount = row.total_amount * taxRate;
            console.log(`Tax for seller ${row.seller_id}: ${taxAmount}`); // Debugging log

            const insertTaxQuery = `
                INSERT INTO taxation (seller_id, order_id, tax_amount, status)
                VALUES ($1, $2, $3, 'Pending')
                ON CONFLICT (seller_id, order_id) DO UPDATE
                SET tax_amount = EXCLUDED.tax_amount;
            `;
            await pool.query(insertTaxQuery, [row.seller_id, order_id, taxAmount]);
        }

        return { success: true, message: 'Tax calculated successfully.' };
    } catch (error) {
        console.error('Error calculating tax:', error);
        throw error;
    }
};

// Pay tax for an order
export const payTax = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const { order_id } = req.body; 

        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Order ID is required.' });
        }

        // Check if tax exists and is pending
        const taxQuery = `
            SELECT tax_amount FROM taxation
            WHERE seller_id = $1 AND order_id = $2 AND status = 'Pending';
        `;
        const taxResult = await pool.query(taxQuery, [seller_id, order_id]);

        if (taxResult.rowCount === 0) {
            return res.status(400).json({ success: false, message: 'No pending tax found for this order.' });
        }

        const taxAmount = taxResult.rows[0].tax_amount;

        // Update tax record to 'Paid'
        const updateTaxQuery = `
            UPDATE taxation 
            SET status = 'Paid', payment_date = CURRENT_TIMESTAMP
            WHERE seller_id = $1 AND order_id = $2;
        `;
        await pool.query(updateTaxQuery, [seller_id, order_id]);

        return res.status(200).json({ success: true, message: 'Tax paid successfully.', taxAmount });
    } catch (error) {
        console.error('Error paying tax:', error);
        res.status(500).json({ success: false, message: 'Error processing tax payment.' });
    }
};

export const getTaxStatus = async (req, res) => {
    try {
        const seller_id = req.user.id;

        const taxQuery = `
            SELECT oi.order_id, oi.product_id, p.name AS product_name, t.tax_amount, t.status, t.payment_date
            FROM taxation t
            JOIN order_items oi ON t.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE t.seller_id = $1;
        `;
        const taxResult = await pool.query(taxQuery, [seller_id]);

        return res.status(200).json({ success: true, taxation: taxResult.rows });
    } catch (error) {
        console.error('Error fetching taxation status:', error);
        res.status(500).json({ success: false, message: 'Error retrieving taxation data.' });
    }
};


// Get due taxation (pending tax payments)
// export const getDueTaxation = async (req, res) => {
//     try {
//         const seller_id = req.user.id;

//         const dueTaxQuery = `
//             SELECT order_id, tax_amount FROM taxation
//             WHERE seller_id = $1 AND status = 'Pending';
//         `;
//         const dueTaxResult = await pool.query(dueTaxQuery, [seller_id]);

//         return res.status(200).json({ success: true, dueTaxes: dueTaxResult.rows });
//     } catch (error) {
//         console.error('Error fetching due taxation:', error);
//         res.status(500).json({ success: false, message: 'Error retrieving due taxation.' });
//     }
// };
// Get due taxation (pending tax payments)
export const getDueTaxation = async (req, res) => {
    try {
        const seller_id = req.user.id;

        const dueTaxQuery = `
            SELECT oi.order_id, oi.product_id, p.name AS product_name, t.tax_amount
            FROM taxation t
            JOIN order_items oi ON t.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE t.seller_id = $1 AND t.status = 'Pending';
        `;
        const dueTaxResult = await pool.query(dueTaxQuery, [seller_id]);

        return res.status(200).json({ success: true, dueTaxes: dueTaxResult.rows });
    } catch (error) {
        console.error('Error fetching due taxation:', error);
        res.status(500).json({ success: false, message: 'Error retrieving due taxation.' });
    }
};

