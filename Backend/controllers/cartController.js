import pool from "../config/postgres.js";

// ✅ Add to Cart
export const addToCart = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const buyer_id = req.user.id; // Extract buyer ID from authenticated user

        if (!product_id || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        const query = `
            INSERT INTO cart (buyer_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (buyer_id, product_id)
            DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
            RETURNING *;
        `;

        const values = [buyer_id, product_id, quantity];
        const result = await pool.query(query, values);

        res.status(200).json({ message: "Cart updated", cartItem: result.rows[0] });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const removeFromCart = async (req, res) => {
    try {
        const { product_id } = req.body;
        const buyer_id = req.user.id;

        if (!product_id) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const query = `
            DELETE FROM cart
            WHERE buyer_id = $1 AND product_id = $2
            RETURNING *;
        `;

        const result = await pool.query(query, [buyer_id, product_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Item removed from cart", removedItem: result.rows[0] });

    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Get Cart Items for Logged-in User
export const getCartItems = async (req, res) => {
    try {
        const buyer_id = req.user.id;

        const query = `
            SELECT cart.product_id, cart.quantity, 
                   products.name AS product_name, 
                   products.price, 
                   COALESCE(products.images[1], '') AS image -- Get first image
            FROM cart
            JOIN products ON cart.product_id = products.id
            WHERE cart.buyer_id = $1;
        `;

        const result = await pool.query(query, [buyer_id]);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const buyer_id = req.user.id;

        if (!product_id || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        const query = `
            UPDATE cart
            SET quantity = $1
            WHERE buyer_id = $2 AND product_id = $3
            RETURNING *;
        `;

        const values = [quantity, buyer_id, product_id];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Cart quantity updated", cartItem: result.rows[0] });

    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).json({ message: "Server error" });
    }
};

