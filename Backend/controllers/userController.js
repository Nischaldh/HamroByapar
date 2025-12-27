import pool from "../config/postgres.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import validator from 'validator'

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password is required" }); // ✅ Added return
  }
  try {
    const query = `SELECT 'buyer' AS role, id, name, email, password FROM buyers WHERE email = $1
      UNION
      SELECT 'seller' AS role, id, name, email, password FROM sellers WHERE email = $1`
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.json({ success: false, message: "Invalid password" })
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    return res.json({ success: true, token, user: result.rows[0] }); // ✅ Added return to prevent further execution
  } catch (error) {
    console.error("Database Query Error:", error.message);
    if (!res.headersSent) { // ✅ Prevents multiple responses
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.json({ success: false, message: error.message })

  }
};


const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    //VALIDATING EMAIL FORMAT AND STRONG PASSWORD
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please Enter a valid email" })
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please Enter a strong password" })
    }
    const checkQuery = `
      SELECT email FROM buyers WHERE email = $1 
      UNION 
      SELECT email FROM sellers WHERE email = $1
    `;
    const existingUser = await pool.query(checkQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.json({ success: false, message: "Email already in use." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let insertQuery;
    let values;

    if (role === "buyer") {
      insertQuery = `
        INSERT INTO buyers (id, name, email, password, role, created_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, 'buyer', NOW()) 
        RETURNING id, name, email, role;
      `;
      values = [name, email, hashedPassword];
    } else {
      insertQuery = `
        INSERT INTO sellers (id, name, email, password, role, created_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, 'seller', NOW()) 
        RETURNING id, name, email, role;
      `;
      values = [name, email, hashedPassword];
    }

    const result = await pool.query(insertQuery, values);
    const user = result.rows[0]
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.status(201).json({ success: true, message: "User registered successfully", token, user: result.rows[0] });

  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }


}

const updateUser = async (req, res) => {
  try {
    // ✅ Get authenticated user's ID
    const userId = req.user.id;
    const { newName, newEmail, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // ✅ Determine if the user is a buyer or seller
    const userCheckQuery = `
      SELECT 'buyer' AS role, email FROM buyers WHERE id = $1 
      UNION 
      SELECT 'seller' AS role, email FROM sellers WHERE id = $1;
    `;
    const userCheckResult = await pool.query(userCheckQuery, [userId]);

    if (userCheckResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userRole = userCheckResult.rows[0].role;
    const currentEmail = userCheckResult.rows[0].email;
    const userTable = userRole === "buyer" ? "buyers" : "sellers";

    // ✅ Check if the new email is already taken (only if it's changing)
    if (newEmail && newEmail !== currentEmail) {
      const emailCheckQuery = `
        SELECT email FROM buyers WHERE email = $1 
        UNION 
        SELECT email FROM sellers WHERE email = $1;
      `;
      const emailExists = await pool.query(emailCheckQuery, [newEmail]);

      if (emailExists.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Email is already in use." });
      }
    }

    // ✅ Prepare the update query dynamically
    let updateFields = [];
    let values = [];
    let index = 1;

    if (newName) {
      updateFields.push(`name = $${index++}`);
      values.push(newName);
    }
    if (newEmail && newEmail !== currentEmail) {
      updateFields.push(`email = $${index++}`);
      values.push(newEmail);
    }
    if (newPassword && newPassword.trim() !== "") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.push(`password = $${index++}`);
      values.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No changes provided" });
    }

    values.push(userId);
    const updateQuery = `
      UPDATE ${userTable} 
      SET ${updateFields.join(", ")}
      WHERE id = $${index} 
      RETURNING id, name, email;
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Profile updated successfully", user: result.rows[0] });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export { login, signup, updateUser };
