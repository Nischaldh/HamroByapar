import pool from "../config/postgres.js";
import jwt from "jsonwebtoken";


export const adminLogin = async (req, res) => {
    try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // SIGN with a payload object
      const token = jwt.sign(
        { email, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "INVALID CREDENTIALS" });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }

}

export const getAllOrdersWithTax = async (req, res) => {
    try {
        const result = await pool.query(`
          SELECT 
            o.id AS order_id,
            o.total_amount,
            b.name AS buyer_name,
            COALESCE(SUM(t.tax_amount), 0) AS total_tax
          FROM orders o
          JOIN buyers b ON o.buyer_id = b.id
          LEFT JOIN taxation t ON o.id = t.order_id
          GROUP BY o.id, o.total_amount, b.name
          ORDER BY o.created_at DESC
        `);
    
        res.status(200).json({success:true, result:result.rows});
      } catch (err) {
        console.error('Error fetching orders with tax info:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    


}

export const getAllSellersWithTax = async (req, res) => {
    try {
        const result = await pool.query(`
          SELECT 
            s.id,
            s.name,
            s.email,
            COALESCE(SUM(CASE WHEN t.status = 'Paid' THEN t.tax_amount ELSE 0 END), 0) AS total_tax_paid,
            COALESCE(SUM(CASE WHEN t.status = 'Pending' THEN t.tax_amount ELSE 0 END), 0) AS tax_due
          FROM sellers s
          LEFT JOIN taxation t ON s.id = t.seller_id
          GROUP BY s.id
          ORDER BY s.created_at DESC
        `);
    
        res.status(200).json({success: true, result:result.rows});
      } catch (err) {
        console.error('Error fetching sellers with tax info:', err);
        res.status(500).json({ message: 'Internal server error' });
      }

}