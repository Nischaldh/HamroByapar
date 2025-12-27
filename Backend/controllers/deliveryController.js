import pool from "../config/postgres.js";

export const addDeliveryInfo = async (req,res)=>{
    const { order_id, name, email, street, city, state, zipcode, country, phone, method } = req.body;

    const query = `
        INSERT INTO delivery_info (order_id, name, email, street, city, state, zipcode, country, phone, method)
        VALUES ($1::UUID, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
    `;

    try {
        const result = await pool.query(query, [order_id, name, email, street, city, state, zipcode, country, phone, method]);
        return res.status(200).json({ message: 'Delivery info added successfully', data: result.rows[0], success:true });
    } catch (error) {
        console.error('Error adding delivery info:', error);
        res.json({ message: error });
    }
}
// controllers/deliveryController.js
export const getDeliveryInfo = async (req, res) => {
    const { orderId } = req.params;

    const query = `
        SELECT * FROM delivery_info WHERE order_id = $1;
    `;

    try {
        const result = await pool.query(query, [orderId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Delivery information not found' });
        }

        return res.status(200).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching delivery info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

