import pool from "../config/postgres.js";
import cloudinary from "../config/cloudinary.js"
// function to add product
const addProduct = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const { name, description, price, stock, category} = req.body;
        if (!name || !price || !stock) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }


        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        // Upload images to Cloudinary and store URLs
        const imageUrls = await Promise.all(
            req.files.map(async (file) => {
                const result = await cloudinary.uploader.upload(`data:image/png;base64,${file.buffer.toString("base64")}`, {
                    folder: "products",
                });
                return result.secure_url;
            })
        );

        // Insert product into PostgreSQL
        const query = `
            INSERT INTO products (seller_id, name, description, price, stock, category, images) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
        `;

        const values = [seller_id, name, description, price, stock, category, imageUrls];
        const result = await pool.query(query, values);

        res.status(201).json({ success: true, message: "Product added successfully", product: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }

}

// function to delete product
const removeProduct = async (req, res) => {
    try {
        const { product_id } = req.body; // Ensure frontend is sending this

        if (!product_id) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        // Fetch product details including images
        const productQuery = `SELECT images FROM products WHERE id = $1`;
        const productResult = await pool.query(productQuery, [product_id]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Extract image URLs
        const imageUrls = productResult.rows[0].images;

        // Delete images from Cloudinary
        if (imageUrls && imageUrls.length > 0) {
            await Promise.all(
                imageUrls.map(async (url) => {
                    const publicId = url.split('/').slice(-2).join('/').split('.')[0]; // Fixed extraction
                    await cloudinary.uploader.destroy(publicId);
                })
            );
        }

        // Delete product from PostgreSQL
        const deleteQuery = `DELETE FROM products WHERE id = $1 RETURNING *`;
        const deleteResult = await pool.query(deleteQuery, [product_id]);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            deletedProduct: deleteResult.rows[0],
        });

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
//Function to list sellers product
const listSellerProducts = async (req, res) => {
    try {
        const seller_id  = req.user.id; // Get seller_id from request parameters

        if (!seller_id) {
            return res.status(400).json({ success: false, message: "Seller ID is required" });
        }

        const query = `SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [seller_id]);

        res.status(200).json({
            success: true,
            products: result.rows,
        });

    } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }

}

//Function to list all the products
const listAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.name AS product_name, p.description, p.price, p.category, 
                p.stock, p.images, p.created_at, 
                s.id AS seller_id, s.name AS seller_name 
            FROM products p
            INNER JOIN sellers s ON p.seller_id = s.id
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query);

        res.json({
            success: true,
            products: result.rows,
        });

    } catch (error) {
        console.error("Error fetching all products:", error);
        res.json({ success: false, message: error.message });
    }

}

export { addProduct, removeProduct, listSellerProducts, listAllProducts }
