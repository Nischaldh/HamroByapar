import pool from "../config/postgres.js";
import { calculateTax } from "./taxationController.js";

// ✅ Place Order (COD or Khalti - delivery handled separately)
export const placeOrder = async (req, res) => {
    const client = await pool.connect();
    try {
      const buyer_id = req.user.id;
      const { payment_method, amount, token } = req.body; // Added token and amount here for Khalti
      let order_id = null;
      
      await client.query("BEGIN");
  
      // Fetch cart items
      const cartQuery = `
        SELECT cart.product_id, cart.quantity, products.price, products.seller_id
        FROM cart
        JOIN products ON cart.product_id = products.id
        WHERE cart.buyer_id = $1;
      `;
      const cartItems = await client.query(cartQuery, [buyer_id]);
  
      if (cartItems.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Cart is empty" });
      }
  
      // Calculate total
      const totalAmount = cartItems.rows.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
  
      // Insert order
      const orderRes = await client.query(
        `
        INSERT INTO orders (buyer_id, total_amount, status, payment_method)
        VALUES ($1, $2, 'Pending', $3)
        RETURNING id;
      `,
        [buyer_id, totalAmount, payment_method]
      );
  
      order_id = orderRes.rows[0].id;
  
      // Handle Khalti payment verification
      if (payment_method === 'khalti') {
        const verifyRes = await axios.post(
          "https://khalti.com/api/v2/payment/verify/",
          { token, amount },
          {
            headers: {
              Authorization: `Bearer ${process.env.KHALTI_SECRET_KEY}`,
            },
          }
        );
  
        if (verifyRes.data.status !== "Completed") {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Payment verification failed" });
        }
  
        // Update the order to 'Paid' after successful verification
        await client.query(
          `
          UPDATE orders
          SET status = 'Paid'
          WHERE id = $1;
        `,
          [order_id]
        );
  
        // Insert payment record
        const insertPaymentQuery = `
          INSERT INTO payments (order_id, amount, payment_method, status)
          VALUES ($1, $2, 'Khalti', 'Completed');
        `;
        await client.query(insertPaymentQuery, [order_id, amount]);
      }
  
      // Insert order items
      const orderItemQuery = `
        INSERT INTO order_items (order_id, product_id, seller_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5);
      `;
      for (const item of cartItems.rows) {
        await client.query(orderItemQuery, [
          order_id,
          item.product_id,
          item.seller_id,
          item.quantity,
          item.price,
        ]);
      }
  
      // Clear cart
      await client.query(`DELETE FROM cart WHERE buyer_id = $1`, [buyer_id]);
  
      await client.query("COMMIT");
  
      res.status(201).json({
        message: "Order placed successfully",
        order_id,
        success: true,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error placing order:", err);
      res.status(500).json({ message: "Server error" });
    } finally {
      client.release();
    }
  };
  

// ✅ Get Buyer's Orders
export const getBuyersOrder = async (req, res) => {
  try {
    const buyer_id = req.user.id;
    const query = `
      SELECT 
        o.id AS order_id, o.total_amount, o.created_at AS order_date,
        o.status AS order_status, o.payment_method,
        oi.id AS order_item_id, oi.product_id, oi.seller_id,
        oi.quantity, oi.price AS item_price, oi.status AS item_status,
        p.name AS product_name, p.images AS product_images,
        s.name AS seller_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON oi.seller_id = s.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC;
    `;
    const result = await pool.query(query, [buyer_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching buyer's orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Seller's Orders
export const getSellerOrder = async (req, res) => {
  try {
    const seller_id = req.user.id;
    const query = `
      SELECT 
        o.id AS order_id, o.buyer_id, o.total_amount, o.status AS order_status,
        o.created_at AS order_created_at,
        oi.product_id, p.name AS product_name, p.images AS product_images,
        oi.quantity, oi.price, oi.status AS item_status,
        b.name AS buyer_name, b.email AS buyer_email
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN buyers b ON o.buyer_id = b.id
      WHERE oi.seller_id = $1
      ORDER BY o.created_at DESC;
    `;
    const result = await pool.query(query, [seller_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching seller's orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Order Status (Per seller)
export const updateOrderStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id, status } = req.body;
    const seller_id = req.user.id;

    await client.query("BEGIN");

    const checkSellerQuery = `
      SELECT id, price, quantity FROM order_items
      WHERE order_id = $1 AND seller_id = $2;
    `;
    const result = await client.query(checkSellerQuery, [order_id, seller_id]);

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const updateStatusQuery = `
      UPDATE order_items
      SET status = $1
      WHERE order_id = $2 AND seller_id = $3;
    `;
    await client.query(updateStatusQuery, [status, order_id, seller_id]);

    // If delivered, calculate tax
    if (status.toLowerCase() === "delivered") {
      await calculateTax(order_id);
    }

    const checkOrderStatusQuery = `
      SELECT status FROM order_items WHERE order_id = $1;
    `;
    const statusResult = await client.query(checkOrderStatusQuery, [order_id]);
    const uniqueStatuses = [
      ...new Set(statusResult.rows.map((r) => r.status)),
    ];

    const overallStatus =
      uniqueStatuses.length === 1 ? uniqueStatuses[0] : "Processing";

    await client.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      [overallStatus, order_id]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Order status updated successfully",
      success: true,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
